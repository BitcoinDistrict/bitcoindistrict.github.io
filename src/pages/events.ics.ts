import type { APIRoute } from 'astro';
import { getICSContent } from '~/utils/ics-generator';

// Ensure this endpoint is prerendered to a static file at build time
export const prerender = true;

/**
 * API endpoint to generate and serve the ICS calendar file
 * Accessible at /events.ics
 */
export const GET: APIRoute = async ({ params, request }) => {
  try {
    // Generate the ICS content from all event sources
    const icsContent = await getICSContent();
    
    // Return the ICS file with proper headers
    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="bitcoin-district-events.ics"',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating ICS file:', error);
    
    return new Response('Error generating calendar file', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
};