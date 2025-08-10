import { fetchAllUpcomingEvents, type MeetupEvent } from './events';

/**
 * ICS Generator Utility
 * Generates a valid ICS (iCalendar) file from aggregated event data
 * 
 * Features:
 * - Combines events from multiple meetup iCal sources
 * - Includes manual events from events-data.ts
 * - Generates RFC 5545 compliant ICS format
 * - Includes timezone information for America/New_York
 * - Properly escapes special characters
 * - Includes event metadata (URL, location, organizer)
 * 
 * Usage:
 * - Static generation: Use generateICSFile() at build time
 * - Dynamic API: Use getICSContent() in API endpoints
 * - Calendar subscription: Serve at /events.ics endpoint
 * 
 * The generated ICS file can be:
 * - Downloaded and imported into calendar apps
 * - Subscribed to as a live calendar feed
 * - Used by calendar applications that support iCal format
 */

/**
 * Formats a date for ICS UTC format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDateUTC(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Formats a date in a given TZID for ICS (local time, no Z)
 * Example output: 20250805T180000
 */
function formatICSDateInTZID(date: Date, tzid: string): string {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tzid,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const lookup = (type: string) => parts.find(p => p.type === type)?.value || '';
  const [month, day, year] = [lookup('month'), lookup('day'), lookup('year')];
  const [hour, minute, second] = [lookup('hour'), lookup('minute'), lookup('second')];
  // Ensure YYYYMMDDTHHMMSS
  return `${year}${month}${day}T${hour}${minute}${second}`;
}

/**
 * Escapes special characters for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Folds a line to meet RFC 5545 requirements (max 75 characters per line)
 * Continuation lines are indented with a space
 */
function foldLine(line: string): string {
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
 * Generates a unique identifier for ICS events
 */
function generateUID(event: MeetupEvent): string {
  // Use existing ID if available, otherwise generate from title and date
  if (event.id) {
    return `${event.id}@bitcoindistrict.org`;
  }
  
  const cleanTitle = event.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const timestamp = event.startDate.getTime();
  return `${cleanTitle}-${timestamp}@bitcoindistrict.org`;
}

/**
 * Generates an ICS event component
 */
function generateICSEvent(event: MeetupEvent): string {
  const uid = generateUID(event);
  const tzid = 'America/New_York';
  const dtstartLocal = formatICSDateInTZID(event.startDate, tzid);
  const dtendLocal = formatICSDateInTZID(event.endDate, tzid);
  const dtstamp = formatICSDateUTC(new Date()); // Current timestamp in UTC
  const summary = escapeICSText(event.title);
  const description = escapeICSText(event.description);
  const location = event.location ? escapeICSText(event.location) : '';
  const url = event.url || '';
  
  let icsEvent = `BEGIN:VEVENT\r\n`;
  icsEvent += foldLine(`UID:${uid}`) + `\r\n`;
  icsEvent += foldLine(`DTSTAMP:${dtstamp}`) + `\r\n`;
  icsEvent += foldLine(`DTSTART;TZID=${tzid}:${dtstartLocal}`) + `\r\n`;
  icsEvent += foldLine(`DTEND;TZID=${tzid}:${dtendLocal}`) + `\r\n`;
  icsEvent += foldLine(`SUMMARY:${summary}`) + `\r\n`;
  icsEvent += foldLine(`DESCRIPTION:${description}`) + `\r\n`;
  
  if (location) {
    icsEvent += foldLine(`LOCATION:${location}`) + `\r\n`;
  }
  
  if (url) {
    icsEvent += foldLine(`URL:${url}`) + `\r\n`;
  }
  
  // Add organizer information
  icsEvent += foldLine(`ORGANIZER;CN=${escapeICSText(event.source)}:mailto:events@bitcoindistrict.org`) + `\r\n`;
  
  // Add categories
  icsEvent += foldLine(`CATEGORIES:Bitcoin,Cryptocurrency,Meetup`) + `\r\n`;
  
  // Add status
  icsEvent += foldLine(`STATUS:CONFIRMED`) + `\r\n`;
  
  // Add transparency (show as busy)
  icsEvent += foldLine(`TRANSP:OPAQUE`) + `\r\n`;
  
  icsEvent += `END:VEVENT\r\n`;
  
  return icsEvent;
}

/**
 * Generates a complete ICS file content from events
 */
export function generateICSContent(events: MeetupEvent[]): string {
  // ICS file header
  let icsContent = `BEGIN:VCALENDAR\r\n`;
  icsContent += `VERSION:2.0\r\n`;
  icsContent += foldLine(`PRODID:-//Bitcoin District//Bitcoin Events//EN`) + `\r\n`;
  icsContent += `CALSCALE:GREGORIAN\r\n`;
  icsContent += `METHOD:PUBLISH\r\n`;
  icsContent += foldLine(`X-WR-CALNAME:Bitcoin District Events`) + `\r\n`;
  icsContent += foldLine(`X-WR-CALDESC:Bitcoin and cryptocurrency events in the DC metro area`) + `\r\n`;
  icsContent += foldLine(`X-WR-TIMEZONE:America/New_York`) + `\r\n`;
  
  // Add timezone information for ET/EST
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
  
  // Add events
  events.forEach(event => {
    icsContent += generateICSEvent(event);
  });
  
  // ICS file footer
  icsContent += `END:VCALENDAR\r\n`;
  
  return icsContent;
}

/**
 * Generates and saves ICS file to public directory
 */
export async function generateICSFile(): Promise<string> {
  try {
    // Fetch all events from all sources
    const events = await fetchAllUpcomingEvents();
    
    // Generate ICS content
    const icsContent = generateICSContent(events);
    
    // In a Node.js environment, you would write to file system
    // For Astro build time, we'll return the content to be written
    console.log(`Generated ICS file with ${events.length} events`);
    
    return icsContent;
  } catch (error) {
    console.error('Error generating ICS file:', error);
    throw error;
  }
}

/**
 * Get all events and return ICS content (for API endpoints)
 */
export async function getICSContent(): Promise<string> {
  const events = await fetchAllUpcomingEvents();
  return generateICSContent(events);
}