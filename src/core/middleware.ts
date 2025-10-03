import { Env } from '../types';
import { ResponseBuilder } from './response-builder';

export interface MiddlewareContext {
  request: Request;
  env: Env;
  path: string;
  method: string;
}

export type Middleware = (context: MiddlewareContext) => Promise<Response | null>;

export class MiddlewareManager {
  private middlewares: Middleware[] = [];

  add(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  async execute(context: MiddlewareContext): Promise<Response | null> {
    for (const middleware of this.middlewares) {
      const response = await middleware(context);
      if (response) {
        return response;
      }
    }
    return null;
  }
}

// Built-in middlewares
export const corsMiddleware: Middleware = async (context) => {
  if (context.method === 'OPTIONS') {
    return ResponseBuilder.cors();
  }
  return null;
};

export const loggingMiddleware: Middleware = async (context) => {
  console.log(`${context.method} ${context.path} - ${new Date().toISOString()}`);
  return null;
};

export const rateLimitMiddleware = (maxRequests = 100, windowMs = 60000): Middleware => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (context) => {
    const clientId = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key);
      }
    }

    const clientData = requests.get(clientId);
    
    if (!clientData || clientData.resetTime < windowStart) {
      requests.set(clientId, { count: 1, resetTime: now });
      return null;
    }

    if (clientData.count >= maxRequests) {
      return ResponseBuilder.error('Rate limit exceeded', 429, {
        retryAfter: Math.ceil((clientData.resetTime + windowMs - now) / 1000),
      });
    }

    clientData.count++;
    return null;
  };
};

export const validationMiddleware = (requiredHeaders: string[] = []): Middleware => {
  return async (context) => {
    for (const header of requiredHeaders) {
      if (!context.request.headers.get(header)) {
        return ResponseBuilder.error(`Missing required header: ${header}`, 400);
      }
    }
    return null;
  };
};