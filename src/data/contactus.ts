// Formspree configuration for the Contact Us form
export const formspreeFormId = 'mgovgdly';

export function getSubmitUrl(): string {
  return `https://formspree.io/f/${formspreeFormId}`;
}


