import { AppsFlyerService } from '../services/appsflyer';
import { Env } from '../types';

// Example usage of AppsFlyerService
export class AppsFlyerExample {
  private appsFlyerService: AppsFlyerService;

  constructor(env: Env) {
    this.appsFlyerService = new AppsFlyerService(env);
  }

  async demonstrateUsage() {
    // Check if AppsFlyer is configured
    if (!this.appsFlyerService.isConfigured()) {
      console.log('AppsFlyer is not properly configured');
      return;
    }

    try {
      // Track a custom event
      const customEventResult = await this.appsFlyerService.trackCustomEvent('user_signup', {
        user_id: '12345',
        signup_method: 'email',
        timestamp: Date.now(),
      });
      console.log('Custom event result:', customEventResult);

      // Track a purchase
      const purchaseResult = await this.appsFlyerService.trackPurchase(29.99, 'USD', {
        product_id: 'premium_subscription',
        user_id: '12345',
      });
      console.log('Purchase result:', purchaseResult);

      // Track app install
      const installResult = await this.appsFlyerService.trackInstall({
        user_id: '12345',
        install_source: 'organic',
        device_type: 'ios',
      });
      console.log('Install result:', installResult);

      // Track app open
      const appOpenResult = await this.appsFlyerService.trackAppOpen({
        user_id: '12345',
        session_id: 'session_123',
      });
      console.log('App open result:', appOpenResult);

      // Get conversion data by AppsFlyer ID
      const conversionData = await this.appsFlyerService.getConversionData('appsflyer_id_123');
      console.log('Conversion data:', conversionData);

      // Get conversion data by customer ID
      const customerConversionData = await this.appsFlyerService.getConversionDataByCustomerId('12345');
      console.log('Customer conversion data:', customerConversionData);

      // Get attribution data
      const attributionData = await this.appsFlyerService.getAttributionData('device_id_123', 'idfa');
      console.log('Attribution data:', attributionData);

    } catch (error) {
      console.error('Error in AppsFlyer demonstration:', error);
    }
  }
}

// Example environment configuration
export const exampleEnv: Env = {
  ENVIRONMENT: 'development',
  APPSFLYER_API_TOKEN: 'your_appsflyer_api_token_here',
  APPSFLYER_APP_ID: 'your_appsflyer_app_id_here',
  APPSFLYER_BASE_URL: 'https://api2.appsflyer.com', // Optional, defaults to this URL
};
