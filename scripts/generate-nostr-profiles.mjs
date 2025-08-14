// Build-time generator for Nostr profiles
// - Reads public/.well-known/nostr.json (name -> hex pubkey)
// - Queries relays for kind:0 metadata (display_name, picture)
// - Downloads and optimizes images to public/nostr/profiles/{hex}.webp
// - Emits public/nostr/profiles.json for the widget to consume

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import WebSocket from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const wellKnownDir = path.join(publicDir, '.well-known');
const nostrJsonPath = path.join(wellKnownDir, 'nostr.json');

const outDir = path.join(publicDir, 'nostr');
const outImagesDir = path.join(outDir, 'profiles');
const outJsonPath = path.join(outDir, 'profiles.json');
const cacheDir = path.join(projectRoot, '.cache', 'nostr-profiles');
const manifestPath = path.join(cacheDir, 'manifest.json');

// Minimal bech32 encoding (BIP-0173) utilities for npub conversion
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
function bech32Polymod(values) {
  let chk = 1;
  const GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  for (let p = 0; p < values.length; ++p) {
    const top = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ values[p];
    for (let i = 0; i < 5; ++i) {
      if ((top >>> i) & 1) chk ^= GENERATORS[i];
    }
  }
  return chk;
}
function bech32HrpExpand(hrp) {
  const ret = [];
  for (let i = 0; i < hrp.length; ++i) ret.push(hrp.charCodeAt(i) >>> 5);
  ret.push(0);
  for (let i = 0; i < hrp.length; ++i) ret.push(hrp.charCodeAt(i) & 31);
  return ret;
}
function bech32CreateChecksum(hrp, data) {
  const values = bech32HrpExpand(hrp).concat(data);
  const polymod = bech32Polymod(values.concat([0, 0, 0, 0, 0, 0])) ^ 1;
  const ret = [];
  for (let p = 0; p < 6; ++p) ret.push((polymod >>> (5 * (5 - p))) & 31);
  return ret;
}
function bech32Encode(hrp, data) {
  const combined = data.concat(bech32CreateChecksum(hrp, data));
  let ret = hrp + '1';
  for (let p = 0; p < combined.length; ++p) ret += BECH32_CHARSET.charAt(combined[p]);
  return ret;
}
function convertBits(data, from, to, pad = true) {
  let acc = 0;
  let bits = 0;
  const ret = [];
  const maxv = (1 << to) - 1;
  const maxAcc = (1 << (from + to - 1)) - 1;
  for (let p = 0; p < data.length; ++p) {
    const value = data[p] & 0xff;
    if (value < 0 || value >> from !== 0) return null;
    acc = ((acc << from) | value) & maxAcc;
    bits += from;
    while (bits >= to) {
      bits -= to;
      ret.push((acc >>> bits) & maxv);
    }
  }
  if (pad) {
    if (bits) ret.push((acc << (to - bits)) & maxv);
  } else if (bits >= from || ((acc << (to - bits)) & maxv)) {
    return null;
  }
  return ret;
}
function hexToBytes(hex) {
  if (hex.startsWith('0x')) hex = hex.slice(2);
  if (hex.length % 2 !== 0) throw new Error('Invalid hex length');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}
function hexToNpub(hex) {
  const data5 = convertBits(hexToBytes(hex), 8, 5, true);
  if (!data5) throw new Error('convertBits failed');
  return bech32Encode('npub', data5);
}

async function readNip05Names() {
  const raw = await fs.promises.readFile(nostrJsonPath, 'utf8');
  const json = JSON.parse(raw);
  const entries = Object.entries(json?.names || {});
  return entries.map(([name, hex]) => ({ name, hex }));
}

function hashNames(names) {
  const s = JSON.stringify(names.map(n => [n.name, n.hex]).sort());
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

async function queryMetadata(authors) {
  const relays = [
    'wss://relay.damus.io',
    'wss://relay.primal.net'
  ];
  const results = new Map();
  const subId = 'bd_meta_' + Math.random().toString(36).slice(2, 10);
  const filter = { kinds: [0], authors };

  await new Promise((resolve) => {
    let settled = false;
    const sockets = [];
    const timer = setTimeout(() => {
      settled = true;
      sockets.forEach(s => { try { s.close(); } catch {} });
      resolve();
    }, 5000);

    relays.forEach((url) => {
      const ws = new WebSocket(url, { handshakeTimeout: 3000 });
      sockets.push(ws);
      ws.on('open', () => {
        ws.send(JSON.stringify(["REQ", subId, filter]));
      });
      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg[0] === 'EVENT' && msg[1] === subId) {
            const evt = msg[2];
            if (evt?.kind === 0 && evt?.pubkey && evt?.content) {
              try {
                const content = JSON.parse(evt.content);
                results.set(evt.pubkey, {
                  display_name: content.display_name || content.name || '',
                  picture: content.picture || '',
                  about: content.about || ''
                });
              } catch {}
            }
          } else if (msg[0] === 'EOSE' && msg[1] === subId) {
            try { ws.close(); } catch {}
            if (!settled && sockets.every(s => s.readyState === 3)) {
              settled = true;
              clearTimeout(timer);
              resolve();
            }
          }
        } catch {}
      });
      ws.on('error', () => { try { ws.close(); } catch {} });
    });
  });

  return results;
}

async function downloadBuffer(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function optimizeToWebp(inputBuffer, size = 256) {
  return await sharp(inputBuffer)
    .resize(size, size, { fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function build() {
  try {
    const names = await readNip05Names();
    if (!names.length) {
      console.log('No NIP-05 names found; skipping Nostr profiles generation');
      return;
    }

    await ensureDir(outImagesDir);
    await ensureDir(cacheDir);

    const namesHash = hashNames(names);

    // Try cache manifest for up-to-24h reuse to avoid hitting relays every build
    let metaMap;
    const TTL_MS = 24 * 60 * 60 * 1000;
    let manifest = null;
    try {
      const raw = await fs.promises.readFile(manifestPath, 'utf8');
      manifest = JSON.parse(raw);
    } catch {}

    const manifestFresh = manifest && manifest.namesHash === namesHash && (Date.now() - (manifest.updatedAt || 0) < TTL_MS);
    if (manifestFresh && Array.isArray(manifest.results)) {
      metaMap = new Map(manifest.results.map(r => [r.hex, { display_name: r.display, picture: r.pictureOriginal || '' }]));
    } else {
      const authors = names.map(n => n.hex);
      metaMap = await queryMetadata(authors);
    }

    const results = [];
    for (const n of names) {
      const npub = (() => { try { return hexToNpub(n.hex); } catch { return ''; } })();
      const meta = metaMap.get(n.hex) || {};
      const display = meta.display_name || n.name;
      const picture = meta.picture || '';

      let imagePath = '';
      let pictureOriginal = picture;
      if (picture) {
        try {
          const raw = await downloadBuffer(picture);
          const optimized = await optimizeToWebp(raw, 256);
          const fileName = `${n.hex}.webp`;
          const filePath = path.join(outImagesDir, fileName);
          await fs.promises.writeFile(filePath, optimized);
          imagePath = `/nostr/profiles/${fileName}`;
        } catch (e) {
          // Ignore image failures; we'll fall back to initials in UI
          console.warn(`Image optimization failed for ${n.name} (${n.hex}):`, e?.message || e);
        }
      }

      results.push({
        name: n.name,
        hex: n.hex,
        npub,
        display,
        picture: imagePath,
        pictureOriginal
      });
    }

    await ensureDir(outDir);
    await fs.promises.writeFile(outJsonPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`Generated ${outJsonPath} with ${results.length} profiles`);

    // Update manifest cache
    try {
      await fs.promises.writeFile(manifestPath, JSON.stringify({ namesHash, updatedAt: Date.now(), results }, null, 2), 'utf8');
    } catch {}
  } catch (err) {
    console.error('Failed to generate Nostr profiles:', err);
  }
}

await build();


