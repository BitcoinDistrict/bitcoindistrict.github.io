import { FORMS } from 'astrowind:config';

// Formspree configuration for the Contact Us form
export const formspreeFormId = 'mgovgdly';

export function getSubmitUrl(): string {
  return `https://formspree.io/f/${formspreeFormId}`;
}

// Get reCAPTCHA site key from the virtual config module
export function getRecaptchaSiteKey(): string | undefined {
  return FORMS?.recaptcha?.siteKey || undefined;
}


