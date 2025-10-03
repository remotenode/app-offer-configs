// Request and Response are available globally in Cloudflare Workers
import { Env } from '../types';

export class HealthHandler {
  // Handle GET /health
  async handleHealthCheck(request: Request, env: Env): Promise<Response> {
    try {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env.ENVIRONMENT || 'development',
        version: '1.0.0',
        services: {
          appsflyer: await this.checkAppsFlyerService(env),
          firebase: await this.checkFirebaseService(env),
        },
      };

      return new Response(JSON.stringify(healthData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

    } catch (error) {
      console.error('Health check error:', error);
      
      return new Response(JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  // Check AppsFlyer service availability
  private async checkAppsFlyerService(env: Env): Promise<{ status: string; error?: string }> {
    try {
      if (!env.APPSFLYER_API_TOKEN) {
        return { status: 'unhealthy', error: 'Missing AppsFlyer API token' };
      }

      // In a real implementation, you might make a test API call
      // For now, we'll just check if the token exists
      return { status: 'healthy' };

    } catch (error) {
      return { status: 'unhealthy', error: 'AppsFlyer service check failed' };
    }
  }

  // Check Firebase service availability
  private async checkFirebaseService(env: Env): Promise<{ status: string; error?: string }> {
    try {
      if (!env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        return { status: 'unhealthy', error: 'Missing Firebase service account key' };
      }

      // In a real implementation, you might make a test API call
      // For now, we'll just check if the key exists
      return { status: 'healthy' };

    } catch (error) {
      return { status: 'unhealthy', error: 'Firebase service check failed' };
    }
  }

  // Handle GET /health/ready (readiness probe)
  async handleReadinessCheck(request: Request, env: Env): Promise<Response> {
    try {
      // Check if all required services are available
      const appsFlyerStatus = await this.checkAppsFlyerService(env);
      const firebaseStatus = await this.checkFirebaseService(env);

      const isReady = appsFlyerStatus.status === 'healthy' && firebaseStatus.status === 'healthy';

      return new Response(JSON.stringify({
        ready: isReady,
        timestamp: new Date().toISOString(),
        services: {
          appsflyer: appsFlyerStatus,
          firebase: firebaseStatus,
        },
      }), {
        status: isReady ? 200 : 503,
        headers: {
          'Content-Type': 'application/json',
        },
      });

    } catch (error) {
      console.error('Readiness check error:', error);
      
      return new Response(JSON.stringify({
        ready: false,
        timestamp: new Date().toISOString(),
        error: 'Readiness check failed',
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  // Handle GET /health/live (liveness probe)
  async handleLivenessCheck(request: Request, env: Env): Promise<Response> {
    // Liveness check is simple - just return OK if the worker is running
    return new Response(JSON.stringify({
      alive: true,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}