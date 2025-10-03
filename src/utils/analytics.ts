import { LogEntry, ConfigRequest, ConfigResponse } from '../types';

export class AnalyticsService {
  // Track configuration request
  static async trackConfigRequest(
    requestData: ConfigRequest,
    response: ConfigResponse,
    responseTime: number,
    env: any
  ): Promise<void> {
    try {
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: response.ok ? 'info' : 'warn',
        event: 'config_request',
        data: {
          bundleId: requestData.bundle_id,
          afId: requestData.af_id,
          platform: requestData.os,
          responseTime,
          cacheHit: false,
          error: response.ok ? undefined : response.message,
        },
      };

      // Log to console (in production, you'd send to analytics service)
      console.log('Analytics:', JSON.stringify(logEntry, null, 2));

      // You could send to external analytics services here
      // await this.sendToExternalAnalytics(logEntry, env);

    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  }

  // Track error events
  static async trackError(
    error: Error,
    context: {
      bundleId?: string;
      afId?: string;
      platform?: string;
      endpoint?: string;
    },
    env: any
  ): Promise<void> {
    try {
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        event: 'error',
        data: {
          bundleId: context.bundleId || 'unknown',
          afId: context.afId || 'unknown',
          platform: context.platform || 'unknown',
          responseTime: 0,
          cacheHit: false,
          error: error.message,
        },
      };

      console.error('Error Analytics:', JSON.stringify(logEntry, null, 2));

    } catch (analyticsError) {
      console.error('Error in analytics tracking:', analyticsError);
    }
  }

  // Track performance metrics
  static async trackPerformance(
    operation: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: success ? 'info' : 'warn',
        event: 'performance',
        data: {
          bundleId: metadata?.bundleId || 'system',
          afId: metadata?.afId || 'system',
          platform: metadata?.platform || 'system',
          responseTime: duration,
          cacheHit: false,
          error: success ? undefined : 'Performance issue',
        },
      };

      console.log('Performance Analytics:', JSON.stringify(logEntry, null, 2));

    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }

  // Get request summary for logging
  static getRequestSummary(requestData: ConfigRequest): {
    bundleId: string;
    afId: string;
    platform: string;
    isFirstLaunch: boolean;
    afStatus: string;
    mediaSource: string;
  } {
    return {
      bundleId: requestData.bundle_id,
      afId: requestData.af_id,
      platform: requestData.os,
      isFirstLaunch: requestData.is_first_launch || false,
      afStatus: requestData.af_status || 'Unknown',
      mediaSource: requestData.media_source || 'Unknown',
    };
  }

  // Format error for logging
  static formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error';
  }
}