import { Env, MobileAppConfigRequest, MobileAppConfigResponse } from '../types';
import { DatabaseService } from '../services/database';
import { AppsFlyerService } from '../services/appsflyer';

export class ConfigHandler {
  private databaseService: DatabaseService;
  private appsFlyerService: AppsFlyerService;

  constructor(private env: Env) {
    this.databaseService = new DatabaseService(env);
    this.appsFlyerService = new AppsFlyerService(env);
  }

  async handleConfigRequest(request: Request): Promise<Response> {
    try {
      const configData: MobileAppConfigRequest = await request.json();
      
      // Validate required fields
      if (!configData.af_id || !configData.bundle_id || !configData.os) {
        return this.createErrorResponse('Missing required fields: af_id, bundle_id, os', 400);
      }

      // Store the mobile phone request
      await this.storeMobileRequest(configData);

      // Store push token if provided
      if (configData.push_token) {
        await this.storePushToken(configData);
      }

      // Track AppsFlyer events
      await this.trackAppsFlyerEvents(configData);

      // Determine if WebView should be shown
      const shouldShowWebView = this.shouldShowWebView(configData);

      if (shouldShowWebView) {
        const configResponse = await this.getWebViewConfig(configData);
        return this.createSuccessResponse(configResponse);
      } else {
        return this.createErrorResponse('No data', 404);
      }

    } catch (error) {
      console.error('Error handling config request:', error);
      return this.createErrorResponse('Internal server error', 500);
    }
  }

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

  private async storeMobileRequest(configData: MobileAppConfigRequest): Promise<void> {
    try {
      await this.databaseService.storeMobilePhoneRequest({
        phone_number: this.extractPhoneNumber(configData),
        country_code: this.extractCountryCode(configData),
        request_type: 'offer_config',
        user_agent: 'Mobile App',
        ip_address: 'unknown', // Would be extracted from request headers
        timestamp: new Date().toISOString(),
        status: 'pending',
        metadata: {
          af_id: configData.af_id,
          bundle_id: configData.bundle_id,
          os: configData.os,
          store_id: configData.store_id,
          locale: configData.locale,
          af_status: configData.af_status,
          campaign: configData.campaign,
          media_source: configData.media_source,
        },
      });
    } catch (error) {
      console.error('Failed to store mobile request:', error);
    }
  }

  private async storePushToken(configData: MobileAppConfigRequest): Promise<void> {
    try {
      if (configData.push_token) {
        await this.databaseService.storePushToken({
          phone_number: this.extractPhoneNumber(configData),
          push_token: configData.push_token,
          platform: configData.os.toLowerCase() as 'ios' | 'android',
          app_version: '1.0.0', // Would be extracted from request
          device_id: configData.af_id,
          is_active: true,
        });
      }
    } catch (error) {
      console.error('Failed to store push token:', error);
    }
  }

  private async trackAppsFlyerEvents(configData: MobileAppConfigRequest): Promise<void> {
    try {
      // Track app install if first launch
      if (configData.is_first_launch) {
        await this.appsFlyerService.trackInstall({
          af_id: configData.af_id,
          bundle_id: configData.bundle_id,
          os: configData.os,
          campaign: configData.campaign,
          media_source: configData.media_source,
        });
      }

      // Track app open
      await this.appsFlyerService.trackAppOpen({
        af_id: configData.af_id,
        bundle_id: configData.bundle_id,
        os: configData.os,
      });

      // Track custom event for config request
      await this.appsFlyerService.trackCustomEvent('config_request', {
        af_id: configData.af_id,
        bundle_id: configData.bundle_id,
        os: configData.os,
        af_status: configData.af_status,
      });

    } catch (error) {
      console.error('Failed to track AppsFlyer events:', error);
    }
  }

  private shouldShowWebView(configData: MobileAppConfigRequest): boolean {
    // According to docs, WebView should only show for non-organic installs
    // For testing, it should show for af_status: "Non-organic"
    return configData.af_status === 'Non-organic';
  }

  private async getWebViewConfig(configData: MobileAppConfigRequest): Promise<MobileAppConfigResponse> {
    // In a real implementation, this would:
    // 1. Query a database for available offers/URLs
    // 2. Apply business logic based on campaign data
    // 3. Return appropriate URL and expiration
    
    // For now, return a test URL as specified in docs
    const testUrl = 'https://test-web.syndi-test.net/';
    const expires = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now

    return {
      ok: true,
      url: testUrl,
      expires: expires,
    };
  }

  private extractPhoneNumber(configData: MobileAppConfigRequest): string {
    // In a real implementation, phone number would be extracted from:
    // - Device information
    // - User registration data
    // - Or other sources
    // For now, use af_id as a placeholder
    return `+${configData.af_id.slice(-10)}`;
  }

  private extractCountryCode(configData: MobileAppConfigRequest): string {
    // Extract country code from locale or other data
    if (configData.locale) {
      const parts = configData.locale.split('_');
      return parts[0].toUpperCase();
    }
    return 'US'; // Default
  }

  private createSuccessResponse(data: MobileAppConfigResponse): Response {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  private createErrorResponse(message: string, status: number): Response {
    return new Response(JSON.stringify({
      ok: false,
      message: message,
    }), {
      status: status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
