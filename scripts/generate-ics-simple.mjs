#!/usr/bin/env node

/**
 * Simple build script to generate static ICS file
 * This creates a basic ICS file with sample data that can be enhanced later
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Folds a line to meet RFC 5545 requirements (max 75 characters per line)
 * Continuation lines are indented with a space
 */
function foldLine(line) {
  if (line.length <= 75) {
    return line;
  }
  
  let result = '';
  let remaining = line;
  
  // First line can be up to 75 characters (including the \r that will be added)
  result += remaining.substring(0, 74) + '\r\n';
  remaining = remaining.substring(74);
  
  // Continuation lines start with a space and can be up to 74 characters total (75 - 1 for the space, minus 1 for \r)
  while (remaining.length > 0) {
    const chunk = remaining.substring(0, 73);
    result += ' ' + chunk + '\r\n';
    remaining = remaining.substring(73);
  }
  
  // Remove the trailing \r\n since it will be added by the caller
  return result.slice(0, -2);
}

/**
 * Basic ICS file generator for initial setup
 */
function generateBasicICSContent() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  
  let icsContent = `BEGIN:VCALENDAR\r\n`;
  icsContent += `VERSION:2.0\r\n`;
  icsContent += `PRODID:-//Bitcoin District//Bitcoin Events//EN\r\n`;
  icsContent += `CALSCALE:GREGORIAN\r\n`;
  icsContent += `METHOD:PUBLISH\r\n`;
  icsContent += `X-WR-CALNAME:Bitcoin District Events\r\n`;
  icsContent += `X-WR-CALDESC:Bitcoin events in the DC metro area\r\n`;
  icsContent += `X-WR-TIMEZONE:America/New_York\r\n`;
  
  // Add timezone information
  icsContent += `BEGIN:VTIMEZONE\r\n`;
  icsContent += `TZID:America/New_York\r\n`;
  icsContent += `BEGIN:DAYLIGHT\r\n`;
  icsContent += `TZOFFSETFROM:-0500\r\n`;
  icsContent += `TZOFFSETTO:-0400\r\n`;
  icsContent += `TZNAME:EDT\r\n`;
  icsContent += `DTSTART:20070311T020000\r\n`;
  icsContent += `RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\r\n`;
  icsContent += `END:DAYLIGHT\r\n`;
  icsContent += `BEGIN:STANDARD\r\n`;
  icsContent += `TZOFFSETFROM:-0400\r\n`;
  icsContent += `TZOFFSETTO:-0500\r\n`;
  icsContent += `TZNAME:EST\r\n`;
  icsContent += `DTSTART:20071104T020000\r\n`;
  icsContent += `RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\r\n`;
  icsContent += `END:STANDARD\r\n`;
  icsContent += `END:VTIMEZONE\r\n`;
  
  // Add a sample event (will be replaced by real events via API)
  const sampleEventStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
  const sampleEventEnd = new Date(sampleEventStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
  
  icsContent += `BEGIN:VEVENT\r\n`;
  icsContent += foldLine(`UID:sample-event-${timestamp}@bitcoindistrict.org`) + `\r\n`;
  icsContent += foldLine(`DTSTAMP:${timestamp}`) + `\r\n`;
  icsContent += foldLine(`DTSTART:${sampleEventStart.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`) + `\r\n`;
  icsContent += foldLine(`DTEND:${sampleEventEnd.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`) + `\r\n`;
  icsContent += foldLine(`SUMMARY:Bitcoin District Events Calendar`) + `\r\n`;
  icsContent += foldLine(`DESCRIPTION:This calendar aggregates Bitcoin and cryptocurrency events from multiple sources in the DC metro area. Visit our website for the latest events.`) + `\r\n`;
  icsContent += foldLine(`URL:https://bitcoindistrict.org/events`) + `\r\n`;
  icsContent += foldLine(`ORGANIZER;CN=Bitcoin District:mailto:events@bitcoindistrict.org`) + `\r\n`;
  icsContent += foldLine(`CATEGORIES:Bitcoin,Cryptocurrency,Meetup`) + `\r\n`;
  icsContent += foldLine(`STATUS:CONFIRMED`) + `\r\n`;
  icsContent += foldLine(`TRANSP:OPAQUE`) + `\r\n`;
  icsContent += `END:VEVENT\r\n`;
  
  icsContent += `END:VCALENDAR\r\n`;
  
  return icsContent;
}

async function generateICS() {
  try {
    console.log('🗓️  Generating basic ICS file...');
    
    // Generate basic ICS content
    const icsContent = generateBasicICSContent();
    
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
    console.log(`📄 This is a basic ICS file. For live events, use the /events.ics API endpoint.`);
    
  } catch (error) {
    console.error('❌ Error generating ICS file:', error);
    process.exit(1);
  }
}

// Run the generator
generateICS();