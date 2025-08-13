import { meetupSources, eventsConfig, type MeetupSource } from '~/data/events-config';
import { manualEvents, type ManualEvent } from '~/data/events-data';
import fs from 'node:fs';
import path from 'node:path';

export interface MeetupEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  url: string;
  location?: string;
  summary?: string;
  source: string; // Added source field to track where event came from
  icon?: string; // Icon for manual events
}

/**
 * Custom iCal parser for Meetup events
 * Parses the iCal format without external dependencies
 */
class ICalParser {
  private parseDateTime(dateTimeStr: string, tzid?: string): Date {
    // Supports formats like:
    // - 20250805T180000Z (UTC)
    // - 20250805T180000 (interpreted with TZID if provided, default ET)
    // - 20250805 (all-day, interpreted midnight with TZID if provided, default ET)
    const dateTimeMatch = dateTimeStr.match(/^(\d{8})(?:T(\d{6}))(Z)?$/) || dateTimeStr.match(/^(\d{8})$/);
    if (!dateTimeMatch) {
      throw new Error(`Invalid date format: ${dateTimeStr}`);
    }

    const hasTime = dateTimeStr.includes('T');
    const hasZulu = dateTimeStr.endsWith('Z');
    const ymd = (hasTime ? dateTimeMatch[1] : dateTimeMatch[1]) as string;
    const hms = hasTime ? (dateTimeMatch[2] as string) : '000000';

    const year = parseInt(ymd.substring(0, 4));
    const month = parseInt(ymd.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(ymd.substring(6, 8));
    const hour = parseInt(hms.substring(0, 2));
    const minute = parseInt(hms.substring(2, 4));
    const second = parseInt(hms.substring(4, 6));

    // If the string has a trailing Z, treat as UTC
    if (hasZulu) {
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }

    // Determine timezone to interpret the local wall time
    const timezone = tzid || 'America/New_York';

    // Compute DST-aware offset for Eastern time without external deps
    const offsetMinutes = this.getEasternOffsetMinutes(year, month + 1, day, hour);

    // Convert local time in ET to UTC by subtracting the offset (note: ET offsets are negative)
    // Example: ET offset -240 => UTC = local + 240 minutes
    const utcMs = Date.UTC(year, month, day, hour, minute, second) - offsetMinutes * 60_000;
    return new Date(utcMs);
  }

  // Returns offset minutes relative to UTC for America/New_York at the given local time
  // Standard Time: -300 (UTC-5), Daylight Time: -240 (UTC-4)
  private getEasternOffsetMinutes(year: number, month1Based: number, day: number, hour: number): number {
    // Calculate DST start (second Sunday in March, 2:00 local time)
    const march = 2; // 0-based month index for March is 2, but we use 1-based input
    const november = 10; // 1-based input for November is 11, index 10 here

    const secondSundayInMarch = this.getNthWeekdayOfMonth(year, 3, 0, 2); // March (3), Sunday (0), 2nd
    const firstSundayInNovember = this.getNthWeekdayOfMonth(year, 11, 0, 1); // November (11), Sunday (0), 1st

    // Compare input date to DST window [second Sunday in March 02:00, first Sunday in Nov 02:00)
    const dateKey = Number(`${year}${String(month1Based).padStart(2, '0')}${String(day).padStart(2, '0')}${String(hour).padStart(2, '0')}`);
    const dstStartKey = Number(`${year}${'03'}${String(secondSundayInMarch).padStart(2, '0')}${'02'}`);
    const dstEndKey = Number(`${year}${'11'}${String(firstSundayInNovember).padStart(2, '0')}${'02'}`);

    const isDST = dateKey >= dstStartKey && dateKey < dstEndKey;
    return isDST ? -240 : -300;
  }

  // Get the Nth weekday of a month. month1Based (1-12), weekday: 0=Sun..6=Sat
  private getNthWeekdayOfMonth(year: number, month1Based: number, weekday: number, nth: number): number {
    const firstOfMonth = new Date(Date.UTC(year, month1Based - 1, 1));
    const firstWeekday = firstOfMonth.getUTCDay();
    const delta = (7 + weekday - firstWeekday) % 7;
    const day = 1 + delta + (nth - 1) * 7;
    return day;
  }

  private unescapeText(text: string): string {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\')
      .trim();
  }

  private extractUrl(description: string): string {
    // Fallback: find first URL-like string in the description
    const urlMatch = description.match(/https?:\/\/\S+/);
    return urlMatch ? urlMatch[0] : '';
  }

  parse(icalData: string, sourceName: string): MeetupEvent[] {
    const events: MeetupEvent[] = [];
    // Preserve leading spaces for folded lines per RFC 5545; only strip trailing CRs
    const lines = icalData.split(/\r?\n/).map(line => line.replace(/\r$/, ''));
    
    let currentEvent: Partial<MeetupEvent> = {};
    let inEvent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = { source: sourceName };
        continue;
      }
      
      if (line === 'END:VEVENT') {
        if (currentEvent.id && currentEvent.title && currentEvent.startDate && currentEvent.endDate && currentEvent.source) {
          events.push(currentEvent as MeetupEvent);
        }
        inEvent = false;
        currentEvent = {};
        continue;
      }
      
      if (!inEvent) continue;
      
      // Handle multi-line properties (continuation lines start with space or tab)
      let fullLine = line;
      while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
        i++;
        fullLine += lines[i].substring(1); // Remove the leading space/tab
      }
      
      // Parse different properties
      if (fullLine.startsWith('UID:')) {
        currentEvent.id = fullLine.substring(4);
      } else if (fullLine.startsWith('SUMMARY:')) {
        currentEvent.title = this.unescapeText(fullLine.substring(8));
      } else if (fullLine.startsWith('DESCRIPTION:')) {
        const description = this.unescapeText(fullLine.substring(12));
        currentEvent.description = description;
        // Extract URL from description if present
        if (!currentEvent.url) {
          currentEvent.url = this.extractUrl(description);
        }
      } else if (fullLine.startsWith('DTSTART')) {
        const tzidMatch = fullLine.match(/TZID=([^;:]+)/);
        const dateStr = fullLine.split(':')[1];
        currentEvent.startDate = this.parseDateTime(dateStr, tzidMatch?.[1]);
      } else if (fullLine.startsWith('DTEND')) {
        const tzidMatch = fullLine.match(/TZID=([^;:]+)/);
        const dateStr = fullLine.split(':')[1];
        currentEvent.endDate = this.parseDateTime(dateStr, tzidMatch?.[1]);
      } else if (fullLine.startsWith('URL;VALUE=URI:')) {
        currentEvent.url = fullLine.substring(14).trim();
      } else if (fullLine.startsWith('URL:')) {
        currentEvent.url = fullLine.substring(4).trim();
      } else if (fullLine.startsWith('LOCATION:')) {
        currentEvent.location = this.unescapeText(fullLine.substring(9));
      }
    }
    
    return events;
  }
}

/**
 * Fetches events from a single meetup iCal source
 */
async function fetchSingleMeetupSource(source: MeetupSource): Promise<MeetupEvent[]> {
  const parser = new ICalParser();

  // Lightweight build-time cache for iCal content
  const cacheDir = path.join(process.cwd(), '.cache', 'meetup-icals');
  const slug = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const cacheFile = path.join(cacheDir, `${slug(source.name || source.icalUrl)}.ics`);

  async function readCache(): Promise<string | null> {
    try {
      await fs.promises.mkdir(cacheDir, { recursive: true });
      const data = await fs.promises.readFile(cacheFile, 'utf8');
      return data || null;
    } catch {
      return null;
    }
  }

  async function writeCache(data: string): Promise<void> {
    try {
      await fs.promises.mkdir(cacheDir, { recursive: true });
      await fs.promises.writeFile(cacheFile, data, 'utf8');
    } catch (err) {
      // Non-fatal: cache write failure shouldn't break build
      console.warn(`Warning: could not write cache for ${source.name}:`, (err as Error).message);
    }
  }

  try {
    const response = await fetch(source.icalUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch events from ${source.name}: ${response.status} ${response.statusText}`);
    }
    const icalData = await response.text();
    // Update cache on successful fetch
    await writeCache(icalData);
    return parser.parse(icalData, source.name);
  } catch (error) {
    console.error(`Error fetching events from ${source.name}:`, error);
    // Fallback to cache if available
    const cached = await readCache();
    if (cached) {
      console.log(`Using cached iCal for ${source.name}`);
      return parser.parse(cached, source.name);
    }
    return [];
  }
}

/**
 * Converts manual events to MeetupEvent format
 */
function convertManualEvents(): MeetupEvent[] {
  return manualEvents
    .filter(event => event.enabled)
    .map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      url: event.url || '',
      location: event.location,
      source: event.source,
      icon: event.icon,
    }));
}

/**
 * Removes duplicate events by primary key UID (id) or by fallback key (normalized title + start timestamp)
 */
function dedupeEvents(events: MeetupEvent[]): MeetupEvent[] {
  const seenById = new Set<string>();
  const seenByComposite = new Set<string>();
  const result: MeetupEvent[] = [];

  for (const evt of events) {
    const hasId = typeof evt.id === 'string' && evt.id.trim().length > 0;
    if (hasId) {
      if (seenById.has(evt.id)) {
        continue;
      }
    }

    const normalizedTitle = (evt.title || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const compositeKey = `${normalizedTitle}|${evt.startDate.getTime()}`;

    if (seenByComposite.has(compositeKey)) {
      continue;
    }

    if (hasId) {
      seenById.add(evt.id);
    }
    seenByComposite.add(compositeKey);
    result.push(evt);
  }

  return result;
}

/**
 * Fetches and combines events from all configured sources
 */
export async function fetchMeetupEvents(): Promise<MeetupEvent[]> {
  const allEvents: MeetupEvent[] = [];
  
  // Fetch from meetup iCal sources if enabled
  if (eventsConfig.includeMeetupEvents) {
    const activeSources = meetupSources.filter(source => source.enabled);
    
    // Fetch all sources in parallel for better performance
    const meetupEventPromises = activeSources.map(source => fetchSingleMeetupSource(source));
    const meetupEventArrays = await Promise.all(meetupEventPromises);
    
    // Flatten the arrays and add to allEvents
    meetupEventArrays.forEach(events => {
      allEvents.push(...events);
    });
  }
  
  // Add manual events if enabled
  if (eventsConfig.includeManualEvents) {
    const manualEventsList = convertManualEvents();
    allEvents.push(...manualEventsList);
  }
  
  // Dedupe, filter to only future events and sort by start date
  const upcomingEvents = dedupeEvents(allEvents)
    .filter(event => event.startDate >= new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  // Apply maxEvents limit if configured
  if (eventsConfig.maxEvents > 0) {
    return upcomingEvents.slice(0, eventsConfig.maxEvents);
  }
  
  return upcomingEvents;
}

/**
 * Fetches all upcoming events without applying a global max limit.
 * Intended for uses where we need the full set (e.g., ICS generation).
 */
export async function fetchAllUpcomingEvents(): Promise<MeetupEvent[]> {
  const allEvents: MeetupEvent[] = [];

  if (eventsConfig.includeMeetupEvents) {
    const activeSources = meetupSources.filter(source => source.enabled);
    const meetupEventPromises = activeSources.map(source => fetchSingleMeetupSource(source));
    const meetupEventArrays = await Promise.all(meetupEventPromises);
    meetupEventArrays.forEach(events => {
      allEvents.push(...events);
    });
  }

  if (eventsConfig.includeManualEvents) {
    const manualEventsList = convertManualEvents();
    allEvents.push(...manualEventsList);
  }

  // Dedupe and only filter out past events; do not apply any upper window or max limit
  return dedupeEvents(allEvents)
    .filter(event => event.startDate >= new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

/**
 * Format event description for display (remove HTML, limit length)
 */
export function formatEventDescription(description: string, maxLength: number = 200): string {
  // Remove common markdown/HTML patterns and clean up
  const cleanDescription = description
    .replace(/\\n/g, ' ')
    .replace(/\*\*\[([^\]]+)\]\([^)]+\)\*\*/g, '$1') // **[text](url)** -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // **text** -> text
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanDescription.length <= maxLength) {
    return cleanDescription;
  }
  
  return cleanDescription.substring(0, maxLength).trim() + '...';
}

/**
 * Format event time for display
 */
export function formatEventTime(startDate: Date, endDate: Date): string {
  const timeFormat = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });
  
  const startTime = timeFormat.format(startDate);
  const endTime = timeFormat.format(endDate);
  
  return `${startTime} - ${endTime} ET`;
}