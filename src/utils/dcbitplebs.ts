import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { marked } from 'marked';
import type { DCBitPlebsEvent } from '~/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Submodule is at root/dcbitplebs/agenda, and markdown files are in agenda/agenda/ within the submodule
// Try multiple possible paths to handle different submodule locations
const AGENDA_DIR_OPTIONS = [
  path.join(__dirname, '../../dcbitplebs/agenda/agenda'),
  path.join(__dirname, '../../agenda/agenda'),
  path.join(__dirname, '../../dcbitplebs/agenda'),
  path.join(__dirname, '../../agenda'),
];

// Load default RSVP URL from config
function getDefaultRsvpUrl(): string {
  try {
    const configPath = path.join(__dirname, '../config.yaml');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = yaml.load(configContent) as { dcbitplebs?: { defaultRsvpUrl?: string } };
    return config.dcbitplebs?.defaultRsvpUrl || 'https://luma.com/bitcoindistrict';
  } catch (error) {
    console.warn('Failed to load default RSVP URL from config, using fallback');
    return 'https://luma.com/bitcoindistrict';
  }
}

const DEFAULT_RSVP_URL = getDefaultRsvpUrl();

interface Frontmatter {
  eventNumber?: number;
  date: string;
  time: string;
  venue: string;
  address: string;
  rsvp?: string;
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('No frontmatter found in markdown file');
  }

  const frontmatterYaml = match[1];
  const body = match[2];

  try {
    const frontmatter = yaml.load(frontmatterYaml) as Frontmatter;
    return { frontmatter, body };
  } catch (error) {
    throw new Error(`Failed to parse frontmatter: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extract event number from filename (e.g., "001.md" -> 1)
 */
function extractEventNumber(filename: string): number {
  const match = filename.match(/^(\d{3})\.md$/);
  if (!match) {
    throw new Error(`Invalid filename format: ${filename}. Expected format: XXX.md`);
  }
  return parseInt(match[1], 10);
}

/**
 * Read and parse a single event file
 */
async function parseEventFile(filePath: string, filename: string): Promise<DCBitPlebsEvent | null> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);

    const eventNumber = frontmatter.eventNumber ?? extractEventNumber(filename);
    const slug = filename.replace('.md', '');
    const date = new Date(frontmatter.date);

    // Render markdown content to HTML
    const htmlContent = marked.parse(body) as string;

    return {
      eventNumber,
      slug,
      date,
      time: frontmatter.time,
      venue: frontmatter.venue,
      address: frontmatter.address,
      rsvp: frontmatter.rsvp || DEFAULT_RSVP_URL,
      content: htmlContent,
    };
  } catch (error) {
    console.error(`Error parsing event file ${filename}:`, error);
    return null;
  }
}

/**
 * Load all events from the agenda directory
 */
async function loadEvents(): Promise<DCBitPlebsEvent[]> {
  try {
    // Find the first existing agenda directory
    let AGENDA_DIR: string | null = null;
    for (const dir of AGENDA_DIR_OPTIONS) {
      if (fs.existsSync(dir)) {
        AGENDA_DIR = dir;
        break;
      }
    }

    if (!AGENDA_DIR) {
      console.warn(`Agenda directory not found. Tried: ${AGENDA_DIR_OPTIONS.join(', ')}`);
      return [];
    }

    // Read all files in the agenda directory
    const files = await fs.promises.readdir(AGENDA_DIR);

    // Filter for markdown files matching the pattern XXX.md
    const markdownFiles = files.filter((file) => /^\d{3}\.md$/.test(file));

    // Parse all event files
    const events = await Promise.all(
      markdownFiles.map(async (filename) => {
        const filePath = path.join(AGENDA_DIR, filename);
        return await parseEventFile(filePath, filename);
      })
    );

    // Filter out null results and sort by event number (descending - newest first)
    return events
      .filter((event): event is DCBitPlebsEvent => event !== null)
      .sort((a, b) => b.eventNumber - a.eventNumber);
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}

let _events: DCBitPlebsEvent[] | null = null;

/**
 * Fetch all events (cached)
 */
export const fetchEvents = async (): Promise<DCBitPlebsEvent[]> => {
  if (!_events) {
    _events = await loadEvents();
  }
  return _events;
};

/**
 * Find an event by slug
 */
export const findEventBySlug = async (slug: string): Promise<DCBitPlebsEvent | undefined> => {
  const events = await fetchEvents();
  return events.find((event) => event.slug === slug);
};

/**
 * Get static paths for event pages
 */
export const getStaticPathsEvents = async () => {
  const events = await fetchEvents();
  return events.map((event) => ({
    params: {
      slug: event.slug,
    },
    props: { event },
  }));
};

