#!/usr/bin/env node

/**
 * Build script to generate static ICS file
 * This script fetches all events and generates a static events.ics file in the public directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import our ICS generator - note: this may need adjustment based on your build setup
// For now, we'll create a simple version that can be run at build time
import { fetchMeetupEvents } from '../src/utils/events.js';
import { generateICSContent } from '../src/utils/ics-generator.js';

async function generateStaticICS() {
  try {
    console.log('🗓️  Generating static ICS file...');
    
    // Fetch all events
    const events = await fetchMeetupEvents();
    console.log(`📅 Found ${events.length} events`);
    
    // Generate ICS content
    const icsContent = generateICSContent(events);
    
    // Write to public directory
    const publicDir = path.join(__dirname, '..', 'public');
    const icsPath = path.join(publicDir, 'events.ics');
    
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Write the ICS file
    fs.writeFileSync(icsPath, icsContent, 'utf8');
    
    console.log(`✅ Successfully generated ${icsPath}`);
    console.log(`📊 Total events: ${events.length}`);
    
    // Log summary of events
    if (events.length > 0) {
      console.log(`📍 Date range: ${events[0].startDate.toDateString()} - ${events[events.length - 1].startDate.toDateString()}`);
    }
    
  } catch (error) {
    console.error('❌ Error generating ICS file:', error);
    process.exit(1);
  }
}

// Run the generator
generateStaticICS();