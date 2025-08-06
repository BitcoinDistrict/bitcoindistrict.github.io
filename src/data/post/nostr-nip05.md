---
publishDate: 2025-08-06T00:00:00Z
title: 'Get Verified on Nostr with NIP-05'
excerpt: 'Ready to level up your Nostr identity? This guide will walk you through NIP-05 verification, making your profile more credible and easier for others to find. Plus, find out how you can get verified for free at a Bitcoin District event!'
image: '~/assets/images/default.jpg'
tags:
  - nostr
metadata:
  canonical: https://bitcoindistrict.org/blog/nostr-nip-05-verification
---

## What is Nostr and Why Should I Verify My Account?

Nostr is a simple, open protocol that enables a global, decentralized, and censorship-resistant social network. Instead of relying on a central server, Nostr uses a network of relays to distribute messages, putting you in control of your data and your social graph.

You've probably noticed that your Nostr account is identified by a long, complex public key (starting with `npub...`). While this is great for security, it's not very user-friendly. This is where **NIP-05 verification** comes in.

NIP-05 is a Nostr Implementation Possibility that lets you link your `npub` to a human-readable identifier, like `yourname@yourdomain.com`. A verified NIP-05 identifier shows a checkmark next to your name on most Nostr clients, signaling to others that you are a real person and not an imposter.

Verification adds a layer of trust and makes your profile much easier for others to find and follow.

## Get Verified the Easy Way at a Bitcoin District Event

The easiest way to get your NIP-05 verification is to come to one of our Bitcoin District events! We believe in building a strong, trusted community on Nostr, and we're here to help you get set up.

All you need to do is show up at one of our meetups, and one of our team members will take your `npub` and get you verified on `bitcoindistrict.org`. In just a few minutes, you'll have a trusted, human-readable identity on Nostr. It's that simple!

Keep an eye on our events calendar to find out when the next meetup is happening. We look forward to seeing you there!

## Do-It-Yourself Verification

If you're more technically inclined or can't make it to an event, you can still get verified on your own. There are three main ways to do this:

### 1. Free Verification Services

Several projects in the Nostr ecosystem offer free NIP-05 verification as a way to support the community. This is a great option if you're just getting started and don't have a custom domain. Keep in mind that these services are run by volunteers, so be sure to thank them or send a few sats their way if you can.

### 2. Paid Verification Services

For a small fee, you can use a paid verification service. These services are often more robust and may offer additional features. This is a good middle-ground if you want a reliable verification without the hassle of setting up your own server.

### 3. Self-Hosted Verification

If you have your own domain name, you can host your own NIP-05 verification file. This gives you the most control over your Nostr identity.

The process involves creating a `nostr.json` file and hosting it at `/.well-known/nostr.json` on your domain. The file should contain your Nostr username and the hexadecimal version of your `npub`.

Here’s an example of what the `nostr.json` file should look like:

```json
{
  "names": {
    "YOUR_USERNAME": "YOUR_HEX_PUBLIC_KEY"
  }
}
```

You'll also need to ensure your server is configured to serve this file with the correct `Access-Control-Allow-Origin` headers.

## A More Trusted Social Experience

Whichever method you choose, getting NIP-05 verified is a big step toward building a more trusted and user-friendly experience on Nostr. It helps you connect with others, grow your network, and contribute to a more secure and decentralized social media landscape.
