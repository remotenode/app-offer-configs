import { Env } from '../types';
import { DatabaseService } from '../services/database';

export class HealthHandler {
  private databaseService: DatabaseService;

  constructor(private env: Env) {
    this.databaseService = new DatabaseService(env);
  }

  async handleHealthCheck(): Promise<Response> {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: this.env.ENVIRONMENT || 'development',
        services: {
          database: await this.checkDatabaseHealth(),
          appsflyer: await this.checkAppsFlyerHealth(),
        },
      };

      return new Response(JSON.stringify(healthStatus), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Health check failed:', error);
      return new Response(JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  async handleReadinessCheck(): Promise<Response> {
    try {
      // Check if database is ready
      const dbReady = await this.checkDatabaseHealth();
      
      if (!dbReady) {
        return new Response(JSON.stringify({
          status: 'not ready',
          timestamp: new Date().toISOString(),
          reason: 'Database not ready',
        }), {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response(JSON.stringify({
        status: 'ready',
        timestamp: new Date().toISOString(),
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Readiness check failed:', error);
      return new Response(JSON.stringify({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: 'Readiness check failed',
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  async handleLivenessCheck(): Promise<Response> {
    // Simple liveness check - just return OK if the service is running
    return new Response(JSON.stringify({
      status: 'alive',
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Try to execute a simple query to check database connectivity
      await this.databaseService.getMobilePhoneRequestStats();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  private async checkAppsFlyerHealth(): Promise<boolean> {
    try {
      // Check if AppsFlyer is configured
      return !!(this.env.APPSFLYER_API_TOKEN && this.env.APPSFLYER_APP_ID);
    } catch (error) {
      console.error('AppsFlyer health check failed:', error);
      return false;
    }
  }
}
