import { DatabaseService } from '../services/database';
import { Env } from '../types';

// Example usage of DatabaseService
export class DatabaseExample {
  private databaseService: DatabaseService;

  constructor(env: Env) {
    this.databaseService = new DatabaseService(env);
  }

  async demonstrateUsage() {
    try {
      // Initialize the database
      await this.databaseService.initializeDatabase();
      console.log('Database initialized');

      // Store a mobile phone request
      const storeResult = await this.databaseService.storeMobilePhoneRequest({
        phone_number: '+1234567890',
        country_code: 'US',
        request_type: 'offer_config',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        ip_address: '192.168.1.1',
        timestamp: new Date().toISOString(),
        status: 'pending',
        metadata: {
          app_version: '1.0.0',
          device_type: 'mobile',
          offer_id: 'offer_123',
        },
      });

      if (storeResult.success) {
        console.log('Mobile phone request stored:', storeResult.request_id);
        
        // Get the stored request
        const getResult = await this.databaseService.getMobilePhoneRequest(storeResult.request_id!);
        if (getResult.success) {
          console.log('Retrieved request:', getResult.data);
        }

        // Update status
        const updateResult = await this.databaseService.updateMobilePhoneRequestStatus(
          storeResult.request_id!,
          'processed'
        );
        console.log('Status updated:', updateResult.success);
      }

      // Get requests by phone number
      const phoneRequests = await this.databaseService.getMobilePhoneRequestsByPhone('+1234567890');
      console.log('Requests for phone:', phoneRequests.length);

      // Get requests by type
      const offerRequests = await this.databaseService.getMobilePhoneRequestsByType('offer_config');
      console.log('Offer config requests:', offerRequests.length);

      // Get recent requests
      const recentRequests = await this.databaseService.getRecentMobilePhoneRequests(10);
      console.log('Recent requests:', recentRequests.length);

      // Get statistics
      const stats = await this.databaseService.getMobilePhoneRequestStats();
      console.log('Database statistics:', stats);

      // Demonstrate push token functionality
      await this.demonstratePushTokens();

    } catch (error) {
      console.error('Error in database demonstration:', error);
    }
  }

  async demonstratePushTokens() {
    try {
      console.log('\n=== Push Token Demonstration ===');

      // Store push tokens
      const iosTokenResult = await this.databaseService.storePushToken({
        phone_number: '+1234567890',
        push_token: 'ios_push_token_demo_123',
        platform: 'ios',
        app_version: '1.0.0',
        device_id: 'device_ios_demo',
        is_active: true,
      });
      console.log('iOS push token stored:', iosTokenResult.success);

      const androidTokenResult = await this.databaseService.storePushToken({
        phone_number: '+1234567890',
        push_token: 'android_push_token_demo_456',
        platform: 'android',
        app_version: '1.0.0',
        device_id: 'device_android_demo',
        is_active: true,
      });
      console.log('Android push token stored:', androidTokenResult.success);

      // Get push tokens by phone number
      const phoneTokens = await this.databaseService.getPushTokensByPhone('+1234567890');
      console.log('Push tokens for phone:', phoneTokens.length);

      // Get push tokens by platform
      const iosTokens = await this.databaseService.getPushTokensByPlatform('ios');
      console.log('iOS push tokens:', iosTokens.length);

      // Update token status
      if (iosTokenResult.token_id) {
        const updateResult = await this.databaseService.updatePushTokenStatus(
          'ios_push_token_demo_123',
          false
        );
        console.log('Token status updated:', updateResult.success);
      }

      // Update last used
      const lastUsedResult = await this.databaseService.updatePushTokenLastUsed(
        'android_push_token_demo_456'
      );
      console.log('Last used updated:', lastUsedResult.success);

      // Get push token statistics
      const pushStats = await this.databaseService.getPushTokenStats();
      console.log('Push token statistics:', pushStats);

      // Get all active push tokens
      const activeTokens = await this.databaseService.getActivePushTokens();
      console.log('Active push tokens:', activeTokens.length);

    } catch (error) {
      console.error('Error in push token demonstration:', error);
    }
  }

  async storeMultipleRequests() {
    const requests = [
      {
        phone_number: '+1234567890',
        country_code: 'US',
        request_type: 'offer_config' as const,
        timestamp: new Date().toISOString(),
        status: 'pending' as const,
        metadata: { offer_id: 'offer_1' },
      },
      {
        phone_number: '+9876543210',
        country_code: 'CA',
        request_type: 'notification' as const,
        timestamp: new Date().toISOString(),
        status: 'pending' as const,
        metadata: { notification_type: 'promotional' },
      },
      {
        phone_number: '+5555555555',
        country_code: 'UK',
        request_type: 'support' as const,
        timestamp: new Date().toISOString(),
        status: 'pending' as const,
        metadata: { issue_type: 'technical' },
      },
    ];

    for (const request of requests) {
      const result = await this.databaseService.storeMobilePhoneRequest(request);
      console.log(`Stored request: ${result.success ? 'Success' : 'Failed'}`);
    }
  }
}

// Example environment configuration
export const exampleEnv: Env = {
  ENVIRONMENT: 'development',
  APPSFLYER_API_TOKEN: 'your_appsflyer_api_token_here',
  APPSFLYER_APP_ID: 'your_appsflyer_app_id_here',
  APPSFLYER_BASE_URL: 'https://api2.appsflyer.com',
  DB: {} as D1Database, // This would be provided by Cloudflare Workers runtime
};