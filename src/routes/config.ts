import { Env, ConfigRequest, ConfigResponse } from '../types';
import { DatabaseService } from '../services/database';

export class ConfigHandler {
  constructor(private env: Env) {}

  /**
   * Handle configuration request
   * This endpoint determines whether to show WebView or fantic based on AppsFlyer data
   */
  async handleConfigRequest(request: Request): Promise<Response> {
    try {
      // Parse request body
      const configRequest: ConfigRequest = await request.json();

      // Validate required fields
      const validation = this.validateConfigRequest(configRequest);
      if (!validation.valid) {
        return this.createErrorResponse(400, validation.message);
      }

      // Initialize database service
      const dbService = new DatabaseService(this.env);
      await dbService.initializeDatabase();

      // Store/update app configuration
      const configResult = await dbService.storeAppConfig({
        af_id: configRequest.af_id,
        bundle_id: configRequest.bundle_id,
        os: configRequest.os,
        store_id: configRequest.store_id,
        locale: configRequest.locale,
        firebase_project_id: configRequest.firebase_project_id,
        app_mode: 'fantic', // Default mode
        is_first_launch: configRequest.is_first_launch || false,
      });

      if (!configResult.success) {
        return this.createErrorResponse(500, 'Failed to store app configuration');
      }

      // Store/update push token
      if (configRequest.push_token) {
        const tokenResult = await dbService.storePushToken({
          af_id: configRequest.af_id,
          push_token: configRequest.push_token,
          platform: configRequest.os.toLowerCase() as 'ios' | 'android',
          bundle_id: configRequest.bundle_id,
          is_active: true,
        });

        if (!tokenResult.success) {
          console.warn('Failed to store push token:', tokenResult.message);
        }
      }

      // Determine app behavior based on AppsFlyer data
      const shouldShowWebView = this.shouldShowWebView(configRequest);

      if (shouldShowWebView) {
        // Get WebView URL from external config service
        const webViewConfig = await this.getWebViewConfig(configRequest);
        
        if (webViewConfig.success && webViewConfig.url) {
          // Update app mode to webview
          await dbService.updateAppMode(configRequest.af_id, 'webview');
          await dbService.updateWebViewUrl(
            configRequest.af_id, 
            webViewConfig.url, 
            webViewConfig.expires || Date.now() + (24 * 60 * 60 * 1000) // 24 hours default
          );

          return this.createSuccessResponse(webViewConfig.url, webViewConfig.expires);
        }
      }

      // Default to fantic mode
      await dbService.updateAppMode(configRequest.af_id, 'fantic');

      return this.createErrorResponse(404, 'No data');

    } catch (error) {
      console.error('Config request error:', error);
      return this.createErrorResponse(500, 'Internal server error');
    }
  }

  /**
   * Validate configuration request
   */
  private validateConfigRequest(request: ConfigRequest): { valid: boolean; message?: string } {
    if (!request.af_id) {
      return { valid: false, message: 'af_id is required' };
    }
    if (!request.bundle_id) {
      return { valid: false, message: 'bundle_id is required' };
    }
    if (!request.os || !['Android', 'iOS'].includes(request.os)) {
      return { valid: false, message: 'os must be Android or iOS' };
    }
    if (!request.store_id) {
      return { valid: false, message: 'store_id is required' };
    }
    if (!request.locale) {
      return { valid: false, message: 'locale is required' };
    }
    if (!request.push_token) {
      return { valid: false, message: 'push_token is required' };
    }
    if (!request.firebase_project_id) {
      return { valid: false, message: 'firebase_project_id is required' };
    }

    return { valid: true };
  }

  /**
   * Determine if WebView should be shown based on AppsFlyer data
   */
  private shouldShowWebView(request: ConfigRequest): boolean {
    // According to documentation, WebView should be shown for non-organic installs
    // Default behavior is to show WebView for non-organic, fantic for organic
    
    // Check af_status - this is the primary indicator
    if (request.af_status === 'Non-organic') {
      return true;
    }
    
    // If af_status is Organic, show fantic
    if (request.af_status === 'Organic') {
      return false;
    }

    // If af_status is not present, check other indicators
    // For testing purposes, you might want to show WebView for certain campaigns
    if (request.campaign && request.campaign.includes('test')) {
      return true;
    }

    // Default to fantic if uncertain
    return false;
  }

  /**
   * Get WebView configuration from external service
   * This would typically call an external API to get the actual WebView URL
   */
  private async getWebViewConfig(request: ConfigRequest): Promise<{ success: boolean; url?: string; expires?: number }> {
    try {
      // In a real implementation, this would call an external service
      // For now, we'll return a test URL
      
      // You would typically make an HTTP request to your external config service here
      // const response = await fetch('https://your-config-service.com/get-url', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     af_id: request.af_id,
      //     bundle_id: request.bundle_id,
      //     // ... other parameters
      //   })
      // });

      // For testing, return a test URL
      return {
        success: true,
        url: 'https://test-web.syndi-test.net/',
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

    } catch (error) {
      console.error('Failed to get WebView config:', error);
      return { success: false };
    }
  }

  /**
   * Create success response
   */
  private createSuccessResponse(url: string, expires?: number): Response {
    const response: ConfigResponse = {
      ok: true,
      url,
      expires,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create error response
   */
  private createErrorResponse(status: number, message: string): Response {
    const response: ConfigResponse = {
      ok: false,
      message,
    };

    return new Response(JSON.stringify(response), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}