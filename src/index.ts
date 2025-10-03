import { Router } from './core/router';
import { DatabaseService } from './services/database';
import { Env } from './types';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Initialize database on first request
      const dbService = new DatabaseService(env);
      await dbService.initializeDatabase();

      // Create router and handle request
      const router = new Router(env);
      return await router.handleRequest(request, env);

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};