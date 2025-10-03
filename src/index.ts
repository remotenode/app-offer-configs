import { ConfigHandler } from './handlers/config';
import { HealthHandler } from './handlers/health';
import { Env } from './types';

// Main worker entry point
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Initialize handlers
    const configHandler = new ConfigHandler(env);
    const healthHandler = new HealthHandler(env);

    try {
      // Route requests based on path and method
      switch (path) {
        case '/api/v1/config':
          if (method === 'POST') {
            // Validate request before processing
            const validation = configHandler.validateRequest(request);
            if (!validation.valid) {
              return new Response(JSON.stringify({
                ok: false,
                message: validation.error,
              }), {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              });
            }

            return await configHandler.handleConfigRequest(request, env);
          } else if (method === 'OPTIONS') {
            return await configHandler.handleOptionsRequest();
          } else {
            return new Response(JSON.stringify({
              ok: false,
              message: 'Method not allowed',
            }), {
              status: 405,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }

        case '/health':
          if (method === 'GET') {
            return await healthHandler.handleHealthCheck(request, env);
          } else {
            return new Response(JSON.stringify({
              error: 'Method not allowed',
            }), {
              status: 405,
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }

        case '/health/ready':
          if (method === 'GET') {
            return await healthHandler.handleReadinessCheck(request, env);
          } else {
            return new Response(JSON.stringify({
              error: 'Method not allowed',
            }), {
              status: 405,
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }

        case '/health/live':
          if (method === 'GET') {
            return await healthHandler.handleLivenessCheck(request, env);
          } else {
            return new Response(JSON.stringify({
              error: 'Method not allowed',
            }), {
              status: 405,
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }

        case '/':
          // Root endpoint - return API information
          return new Response(JSON.stringify({
            name: 'App Offer Configuration API',
            version: '1.0.0',
            environment: env.ENVIRONMENT || 'development',
            endpoints: {
              config: 'POST /api/v1/config',
              health: 'GET /health',
              readiness: 'GET /health/ready',
              liveness: 'GET /health/live',
            },
            documentation: 'https://github.com/your-org/app-offer-config-worker',
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });

        default:
          // 404 for unknown routes
          return new Response(JSON.stringify({
            error: 'Not found',
            message: `The requested resource ${path} was not found`,
            availableEndpoints: [
              'POST /api/v1/config',
              'GET /health',
              'GET /health/ready',
              'GET /health/live',
              'GET /',
            ],
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
      }

    } catch (error) {
      // Global error handler
      console.error('Unhandled error in worker:', error);
      
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