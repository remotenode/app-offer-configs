// Test file for development
export default {
  async fetch(request: Request): Promise<Response> {
    return new Response('Test endpoint working!', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};