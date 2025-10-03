import { Env } from './types';
import { Router } from './core/router';
import { MiddlewareManager, corsMiddleware, loggingMiddleware } from './core/middleware';

// Main worker entry point
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Initialize middleware
    const middlewareManager = new MiddlewareManager();
    middlewareManager.add(loggingMiddleware);
    middlewareManager.add(corsMiddleware);

    // Execute middleware
    const middlewareResponse = await middlewareManager.execute({
      request,
      env,
      path,
      method,
    });

    if (middlewareResponse) {
      return middlewareResponse;
    }

    // Initialize router and handle request
    const router = new Router(env);
    return await router.handleRequest(request, env);
  },
};