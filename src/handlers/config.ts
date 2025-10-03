import { Request, Response } from '@cloudflare/workers-types';
import { ConfigRequest, ConfigResponse, Env, LogEntry } from '../types';
import { validateConfigRequest } from '../utils/validation';
import { ConfigService } from '../services/config';

export class ConfigHandler {
  private configService: ConfigService;

  constructor(env: Env) {
    this.configService = new ConfigService(
      env.APPSFLYER_API_TOKEN,
      env.FIREBASE_SERVICE_ACCOUNT_KEY,
      'default-project' // This would come from the request or env
    );
  }

  // Handle POST /api/v1/config
  async handleConfigRequest(request: Request, env: Env): Promise<Response> {
    const startTime = Date.now();
    let requestData: ConfigRequest | null = null;

    try {
      // Parse request body
      const body = await request.json();
      
      // Validate request data
      const validation = validateConfigRequest(body);
      if (!validation.success) {
        return this.createErrorResponse(400, validation.error);
      }

      requestData = validation.data;

      // Process configuration request
      const response = await this.configService.processConfigRequest(requestData);

      // Log the request
      await this.logRequest(requestData, response, startTime, env);

      // Return response
      return this.createSuccessResponse(response);

    } catch (error) {
      console.error('Error in config handler:', error);
      
      // Log error
      if (requestData) {
        await this.logRequest(requestData, { ok: false, message: 'Internal server error' }, startTime, env);
      }

      return this.createErrorResponse(500, 'Internal server error');
    }
  }

  // Create success response
  private createSuccessResponse(data: ConfigResponse): Response {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  // Create error response
  private createErrorResponse(status: number, message: string): Response {
    const response: ConfigResponse = {
      ok: false,
      message,
    };

    return new Response(JSON.stringify(response), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  // Log request for analytics
  private async logRequest(
    requestData: ConfigRequest,
    response: ConfigResponse,
    startTime: number,
    env: Env
  ): Promise<void> {
    try {
      const responseTime = Date.now() - startTime;
      const summary = this.configService.getConfigSummary(requestData, response);

      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: response.ok ? 'info' : 'warn',
        event: 'config_request',
        data: {
          bundleId: summary.bundleId,
          afId: summary.afId,
          platform: summary.platform,
          responseTime,
          cacheHit: false, // No caching in this implementation
          error: response.ok ? undefined : response.message,
        },
      };

      // In a real implementation, you would send this to your analytics service
      console.log('Config request:', JSON.stringify(logEntry, null, 2));

      // You could also send to Cloudflare Analytics or external service
      // await this.sendToAnalytics(logEntry, env);

    } catch (error) {
      console.error('Error logging request:', error);
    }
  }

  // Send analytics data to external service
  private async sendToAnalytics(logEntry: LogEntry, env: Env): Promise<void> {
    try {
      // Example: Send to Cloudflare Analytics
      if (env.CLOUDFLARE_API_TOKEN) {
        await fetch('https://api.cloudflare.com/client/v4/accounts/{account_id}/analytics/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events: [{
              event: logEntry.event,
              data: logEntry.data,
              timestamp: Date.now(),
            }],
          }),
        });
      }
    } catch (error) {
      console.error('Error sending analytics:', error);
    }
  }

  // Handle OPTIONS request for CORS
  async handleOptionsRequest(): Promise<Response> {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Validate request method and content type
  validateRequest(request: Request): { valid: boolean; error?: string } {
    // Check method
    if (request.method !== 'POST' && request.method !== 'OPTIONS') {
      return { valid: false, error: 'Method not allowed' };
    }

    // Check content type for POST requests
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { valid: false, error: 'Content-Type must be application/json' };
      }
    }

    return { valid: true };
  }
}