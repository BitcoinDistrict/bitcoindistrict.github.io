import yaml from 'js-yaml';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

// Formspree configuration for the Contact Us form
export const formspreeFormId = 'mgovgdly';

export function getSubmitUrl(): string {
  return `https://formspree.io/f/${formspreeFormId}`;
}

// Get reCAPTCHA site key from config.yaml
export function getRecaptchaSiteKey(): string | undefined {
  try {
    // Get the directory of this file, then navigate to config.yaml
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const configPath = join(currentDir, '..', 'config.yaml');
    const configFile = readFileSync(configPath, 'utf-8');
    const config = yaml.load(configFile) as { forms?: { recaptcha?: { siteKey?: string | null } } };
    const siteKey = config?.forms?.recaptcha?.siteKey;
    return siteKey && siteKey !== 'null' ? siteKey : undefined;
  } catch (error) {
    console.warn('Failed to load reCAPTCHA site key from config:', error);
    return undefined;
  }
}


