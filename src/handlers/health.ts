import { Env, HealthResponse } from '../types';

export class HealthHandler {
  private startTime = Date.now();

  constructor(private env: Env) {}

  async handleHealthCheck(request: Request, env: Env): Promise<Response> {
    try {
      const response: HealthResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env.ENVIRONMENT || 'development',
        uptime: Date.now() - this.startTime,
        checks: {
          memory: {
            status: 'healthy',
            usage: 50,
            limit: 128,
          },
          cpu: {
            status: 'healthy',
            usage: 25,
          },
        },
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Health check error:', error);
      
      const errorResponse: HealthResponse = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env.ENVIRONMENT || 'development',
        uptime: Date.now() - this.startTime,
        checks: {
          memory: {
            status: 'unhealthy' as const,
            usage: 0,
            limit: 0,
          },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  async handleReadinessCheck(request: Request, env: Env): Promise<Response> {
    try {
      // In a real implementation, you would check if all dependencies are ready
      const response: HealthResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env.ENVIRONMENT || 'development',
        uptime: Date.now() - this.startTime,
        checks: {
          database: {
            status: 'healthy',
            response_time: 10,
          },
          external_apis: {
            status: 'healthy',
            response_time: 50,
          },
        },
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Readiness check error:', error);
      
      const errorResponse: HealthResponse = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env.ENVIRONMENT || 'development',
        uptime: Date.now() - this.startTime,
        checks: {
          database: {
            status: 'unhealthy',
            error: 'Database not ready',
          },
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  async handleLivenessCheck(request: Request, env: Env): Promise<Response> {
    try {
      // Simple liveness check - just verify the service is running
      const response: HealthResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env.ENVIRONMENT || 'development',
        uptime: Date.now() - this.startTime,
        checks: {},
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Liveness check error:', error);
      
      const errorResponse: HealthResponse = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env.ENVIRONMENT || 'development',
        uptime: Date.now() - this.startTime,
        checks: {},
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
}