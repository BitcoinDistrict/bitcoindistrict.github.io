import { getFormattedDate } from '~/utils/utils';
import { meetupSources, eventsConfig, type MeetupSource } from '~/data/events-config';
import { manualEvents, type ManualEvent } from '~/data/events-data';

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
  private parseDateTime(dateTimeStr: string): Date {
    // Handle TZID format: DTSTART;TZID=America/New_York:20250805T180000
    const dateMatch = dateTimeStr.match(/(\d{8}T\d{6})/);
    if (!dateMatch) {
      throw new Error(`Invalid date format: ${dateTimeStr}`);
    }
    
    const dateStr = dateMatch[1];
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(9, 11));
    const minute = parseInt(dateStr.substring(11, 13));
    const second = parseInt(dateStr.substring(13, 15));
    
    return new Date(year, month, day, hour, minute, second);
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
    // Look for URL in the description or return empty string
    const urlMatch = description.match(/URL;VALUE=URI:(https?:\/\/[^\s]+)/);
    return urlMatch ? urlMatch[1] : '';
  }

  parse(icalData: string, sourceName: string): MeetupEvent[] {
    const events: MeetupEvent[] = [];
    const lines = icalData.split('\n').map(line => line.trim());
    
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
          currentEvent.url = this.extractUrl(fullLine);
        }
      } else if (fullLine.startsWith('DTSTART')) {
        const dateStr = fullLine.split(':')[1];
        currentEvent.startDate = this.parseDateTime(dateStr);
      } else if (fullLine.startsWith('DTEND')) {
        const dateStr = fullLine.split(':')[1];
        currentEvent.endDate = this.parseDateTime(dateStr);
      } else if (fullLine.startsWith('URL;VALUE=URI:')) {
        currentEvent.url = fullLine.substring(14);
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
  try {
    const response = await fetch(source.icalUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events from ${source.name}: ${response.status} ${response.statusText}`);
    }
    
    const icalData = await response.text();
    const parser = new ICalParser();
    return parser.parse(icalData, source.name);
      
  } catch (error) {
    console.error(`Error fetching events from ${source.name}:`, error);
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
  
  // Filter to only future events and sort by start date
  const upcomingEvents = allEvents
    .filter(event => event.startDate >= new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  // Apply maxEvents limit if configured
  if (eventsConfig.maxEvents > 0) {
    return upcomingEvents.slice(0, eventsConfig.maxEvents);
  }
  
  return upcomingEvents;
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