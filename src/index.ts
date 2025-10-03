import { Env } from './types';
import { ConfigHandler } from './routes/config';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    try {
      // Route requests
      if (path === '/config' && request.method === 'POST') {
        const configHandler = new ConfigHandler(env);
        const response = await configHandler.handleConfigRequest(request);
        
        // Add CORS headers to response
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        
        return response;
      }

      // Health check endpoint
      if (path === '/health' && request.method === 'GET') {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          service: 'app-config-service'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ 
        error: 'Not Found',
        message: 'The requested resource was not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });

    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};