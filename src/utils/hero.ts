/**
 * Hero image utility functions for Bitcoin District
 * 
 * This module provides utilities for configuring hero images across the site
 * in a consistent and maintainable way.
 */

export interface HeroImageConfig {
  src?: string;
  alt?: string;
  opacity?: string;
}

export interface ScrollIndicatorConfig {
  text?: string;
  variant?: 'arrow' | 'text' | 'both';
  position?: 'center' | 'left' | 'right';
  color?: 'light' | 'dark' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

export interface HeroConfig {
  image?: string;
  alt?: string;
  opacity?: string;
  title?: string;
  subtitle?: string;
  tagline?: string;
  actions?: any[];
  content?: string;
}

/**
 * Default hero images for different sections of the site
 */
export const HERO_IMAGES = {
  default: '~/assets/images/hero-capitol.jpg',
  index: '~/assets/images/hero-lincoln.jpg',
  events: '~/assets/images/hero-capitol.jpg',
  meetups: '~/assets/images/hero-metro.jpg',
  bookclub: '~/assets/images/hero-bridge.jpg',
  about: '~/assets/images/hero-mlk.jpg',
  learn: '~/assets/images/hero-whitehouse.jpg',
  blog: '~/assets/images/hero-basin.jpg',
  nostr: '~/assets/images/hero-ostriches.jpg',
  // Add more preset hero images here as needed
} as const;

/**
 * Default opacity settings for different themes
 */
export const HERO_OPACITY = {
  light: 'opacity-25 dark:opacity-20',
  lighter: 'opacity-10 dark:opacity-15',
  darker: 'opacity-25 dark:opacity-10',
} as const;

/**
 * Creates a hero image configuration with sensible defaults
 */
export function createHeroImage(config: Partial<HeroImageConfig> = {}): HeroImageConfig {
  return {
    src: config.src || HERO_IMAGES.default,
    alt: config.alt || 'Hero Background',
    opacity: config.opacity || HERO_OPACITY.light,
  };
}

/**
 * Creates a full hero configuration for HeroLayout
 */
export function createHero(config: Partial<HeroConfig> = {}): HeroConfig {
  return {
    image: config.image || HERO_IMAGES.default,
    alt: config.alt || 'Hero Background',
    opacity: config.opacity || HERO_OPACITY.light,
    title: config.title,
    subtitle: config.subtitle,
    tagline: config.tagline,
    actions: config.actions,
    content: config.content,
  };
}

/**
 * Default scroll indicator configurations
 */
export const SCROLL_INDICATOR_PRESETS = {
  default: {
    variant: 'arrow' as const,
    position: 'center' as const,
    color: 'light' as const,
    size: 'md' as const,
  },
  minimal: {
    variant: 'arrow' as const,
    position: 'center' as const,
    color: 'light' as const,
    size: 'sm' as const,
  },
  withText: {
    text: 'Scroll to explore',
    variant: 'both' as const,
    position: 'center' as const,
    color: 'light' as const,
    size: 'md' as const,
  },
  accent: {
    //text: 'Discover more',
    variant: 'both' as const,
    position: 'center' as const,
    color: 'accent' as const,
    size: 'lg' as const,
  },
} as const;

/**
 * Creates a scroll indicator configuration with sensible defaults
 */
export function createScrollIndicator(config: Partial<ScrollIndicatorConfig> = {}): ScrollIndicatorConfig {
  return {
    text: config.text,
    variant: config.variant || SCROLL_INDICATOR_PRESETS.default.variant,
    position: config.position || SCROLL_INDICATOR_PRESETS.default.position,
    color: config.color || SCROLL_INDICATOR_PRESETS.default.color,
    size: config.size || SCROLL_INDICATOR_PRESETS.default.size,
  };
}

/**
 * Predefined hero configurations for common pages
 */
export const HERO_PRESETS = {
  events: {
    image: HERO_IMAGES.events,
    alt: 'Events in Bitcoin District',
    opacity: HERO_OPACITY.lighter,
  },
  // Add more presets as needed
} as const;