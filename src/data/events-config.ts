export interface MeetupSource {
  /** Name/identifier for this meetup group */
  name: string;
  /** Full iCal URL for this meetup group */
  icalUrl: string;
  /** Main meetup group URL */
  url: string;
  /** Optional description of the meetup group */
  description?: string;
  /** Path to logo image in assets directory */
  logo?: string;
  /** Optional Tailwind class for header background color in UI (e.g., 'bg-red-800'). Defaults to 'bg-primary' */
  headerBgClass?: string;
  /** Whether this source is currently active */
  enabled: boolean;
}

/**
 * Configuration for meetup iCal sources
 * Add new meetup groups here by including their iCal URLs
 */
export const meetupSources: MeetupSource[] = [
  {
    name: "Bitcoin District",
    icalUrl: "https://www.meetup.com/bitcoin-district/events/ical/",
    url: "https://www.meetup.com/bitcoin-district/",
    description: "Bitcoin District community meetup group in DC metro area",
    logo: "~/assets/images/logos/bd.png",
    headerBgClass: "bg-red-900",
    enabled: true,
  },
  {
    name: "DC BitDevs",
    icalUrl: "https://www.meetup.com/dc-bit-devs/events/ical/",
    url: "https://www.meetup.com/dc-bit-devs/",
    description: "Community for discussing and advancing Bitcoin and related protocols.",
    logo: "~/assets/images/logos/dcbitdevs.png",
    headerBgClass: "bg-slate-800",
    enabled: true,
  },
  {
    name: "Shenandoah Bitcoin Club",
    icalUrl: "https://www.meetup.com/shenandoah-bitcoin-club/events/ical/",
    url: "https://www.meetup.com/shenandoah-bitcoin-club/",
    description: "Education and collaboration in and around Bitcoin, a new digital money based on the truth of mathematics.",
    logo: "~/assets/images/logos/shenandoah.png",
    headerBgClass: "bg-emerald-900",
    enabled: true,
  },
  {
    name: "Southern Maryland Bitcoiners",
    icalUrl: "https://www.meetup.com/southern-maryland-bitcoiners/events/ical/",
    url: "https://www.meetup.com/southern-maryland-bitcoiners/",
    description: "A group of Bitcoiners in Southern Maryland.",
    logo: "~/assets/images/logos/somd.png",
    headerBgClass: "bg-yellow-900",
    enabled: true,
  },
  // Add more meetup groups here as needed
  // {
  //   name: "DC Bitcoin Developers",
  //   icalUrl: "https://www.meetup.com/example-group/events/ical/",
  //   description: "Developer-focused Bitcoin meetup",
  //   logo: "~/assets/images/dev-group-logo.png",
  //   enabled: true,
  // },
  // {
  //   name: "Northern Virginia Bitcoin",
  //   icalUrl: "https://www.meetup.com/another-group/events/ical/",
  //   description: "Bitcoin meetup for Northern Virginia",
  //   logo: "~/assets/images/nova-bitcoin-logo.png",
  //   enabled: false, // Disabled for now
  // },
];

/**
 * Events configuration
 */
export interface EventsConfig {
  /** Maximum number of events to display */
  maxEvents: number;
  /** Whether to include manual events from events-data.ts */
  includeManualEvents: boolean;
  /** Whether to fetch from meetup iCal sources */
  includeMeetupEvents: boolean;
  /** Default months-ahead window for UI display (widgets may override) */
  defaultMaxMonthsAhead: number;
}

export const eventsConfig: EventsConfig = {
  // Set to 0 to disable global cap; individual widgets control limits via props
  maxEvents: 0,
  includeManualEvents: true,
  includeMeetupEvents: true,
  defaultMaxMonthsAhead: 9,
};