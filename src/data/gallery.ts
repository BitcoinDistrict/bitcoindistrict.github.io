export type GalleryConfig = Record<string, { images: string[] }>;

export const galleries: GalleryConfig = {
  // Default gallery. Add image filenames that exist in `/src/assets/images/gallery/`.
  // Example: 'lincoln.webp', 'meetup-01.jpg'
  eventsHero: {
    images: [
      // Populate with filenames only; we resolve them at runtime via import.meta.glob
      // 'lincoln.webp',
      // 'meetup-01.jpg',
      // 'bitcoin-sign.jpg',
      'bhatia.jpg',
      'braiins.jpg',
      'studybitcoin_compass.jpg',
      'studybitcoin_hal.jpg',
      'studybitcoin_compassroastery.jpg',
    ],
  },
};


