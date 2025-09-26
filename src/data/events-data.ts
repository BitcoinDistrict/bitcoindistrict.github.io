export interface ManualEvent {
  /** Unique identifier for the event */
  id: string;
  /** Event title */
  title: string;
  /** Event description */
  description: string;
  /** Event start date and time */
  startDate: Date;
  /** Event end date and time */
  endDate: Date;
  /** Event URL (optional) */
  url?: string;
  /** Event location (optional) */
  location?: string;
  /** Source/organizer name */
  source: string;
  /** Path to icon/logo image for this event (optional) */
  icon?: string;
  /** Whether this event is currently active/published */
  enabled: boolean;
}

/**
 * Manual events that aren't pulled from meetup iCal feeds
 * Add custom events here that you want to display alongside meetup events
 */
export const manualEvents: ManualEvent[] = [
  // Example event - remove or modify as needed
  {
    id: "btcindc-2025",
    title: "BTC in DC Conference",
    description: "Join industry leaders, technologists, investors and visionaries as we explore and shape the future of Bitcoin during a new conference in downtown DC.",
    startDate: new Date("2025-09-30T09:00:00-04:00"), // April 15, 2025 9:00 AM ET
    endDate: new Date("2025-10-01T17:00:00-04:00"),   // April 15, 2025 5:00 PM ET
    url: "https://btcindc.com",
    location: "Washington, DC",
    source: "George Washington University",
    icon: "~/assets/images/logos/gw.png", // GW logo for the conference
    enabled: true, // Set to true when you want this event to show
  },

  {
    id: "planbworkshop-2025",
    title: "Plan₿ Bitcoin Revolutionaries Workshop",
    description: "Discover Bitcoin’s rise at BTC in DC with GWU & Plan ₿—workshops, courses, and a chance to shape the future.",
    startDate: new Date("2025-09-29T09:00:00-04:00"), // April 15, 2025 9:00 AM ET
    endDate: new Date("2025-09-29T16:00:00-04:00"),   // April 15, 2025 5:00 PM ET
    url: "https://planb.network/en/events/3f12cbf9-73b7-46b7-87ea-6162e68cfd78",
    location: "University Student Center, 800 21st St NW, Washington, DC 20052",
    source: "George Washington University",
    icon: "~/assets/images/logos/gw.png", // GW logo for the conference
    enabled: true, // Set to true when you want this event to show
  },
  
  // Add more manual events here
  // {
  //   id: "custom-workshop-2025",
  //   title: "Bitcoin Self-Custody Deep Dive",
  //   description: "Advanced workshop on Bitcoin self-custody best practices and security.",
  //   startDate: new Date("2025-03-20T18:00:00-04:00"),
  //   endDate: new Date("2025-03-20T21:00:00-04:00"),
  //   url: "https://example.com/workshop",
  //   location: "Arlington, VA",
  //   source: "Bitcoin District",
  //   enabled: true,
  // },
];