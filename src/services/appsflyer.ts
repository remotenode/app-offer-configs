import { Env, AppsFlyerEventData, AppsFlyerConversionData, AppsFlyerApiResponse } from '../types';

export class AppsFlyerService {
  private readonly baseUrl: string;
  private readonly apiToken: string;
  private readonly appId: string;

  constructor(private env: Env) {
    this.baseUrl = env.APPSFLYER_BASE_URL || 'https://api2.appsflyer.com';
    this.apiToken = env.APPSFLYER_API_TOKEN || '';
    this.appId = env.APPSFLYER_APP_ID || '';
    
    if (!this.apiToken) {
      console.warn('AppsFlyer API token not configured');
    }
    if (!this.appId) {
      console.warn('AppsFlyer App ID not configured');
    }
  }

  /**
   * Track an event to AppsFlyer
   */
  async trackEvent(eventName: string, eventData: Record<string, any>): Promise<AppsFlyerApiResponse> {
    try {
      if (!this.apiToken || !this.appId) {
        throw new Error('AppsFlyer API token or App ID not configured');
      }

      const payload: AppsFlyerEventData = {
        eventName,
        eventParameters: eventData,
        timestamp: Date.now(),
        ...eventData, // Allow overriding default values
      };

      const response = await fetch(`${this.baseUrl}/inappevent/${this.appId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AppsFlyer API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      console.log('AppsFlyer event tracked successfully:', eventName, result);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Failed to track AppsFlyer event:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Track a conversion event
   */
  async trackConversion(eventName: string, eventData: Record<string, any>): Promise<AppsFlyerApiResponse> {
    return this.trackEvent(eventName, {
      ...eventData,
      eventType: 'conversion',
    });
  }

  /**
   * Track a purchase event
   */
  async trackPurchase(
    revenue: number,
    currency: string = 'USD',
    additionalData: Record<string, any> = {}
  ): Promise<AppsFlyerApiResponse> {
    return this.trackEvent('af_purchase', {
      af_revenue: revenue,
      af_currency: currency,
      ...additionalData,
    });
  }

  /**
   * Track app install
   */
  async trackInstall(installData: Record<string, any>): Promise<AppsFlyerApiResponse> {
    return this.trackEvent('af_first_open', installData);
  }

  /**
   * Track app open
   */
  async trackAppOpen(openData: Record<string, any> = {}): Promise<AppsFlyerApiResponse> {
    return this.trackEvent('af_app_open', openData);
  }

  /**
   * Get conversion data for a specific AppsFlyer ID
   */
  async getConversionData(appsflyerId: string): Promise<AppsFlyerConversionData | null> {
    try {
      if (!this.apiToken || !this.appId) {
        throw new Error('AppsFlyer API token or App ID not configured');
      }

      const response = await fetch(
        `${this.baseUrl}/conversion_data/${this.appId}?appsflyer_id=${appsflyerId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No conversion data found for AppsFlyer ID:', appsflyerId);
          return null;
        }
        const errorText = await response.text();
        throw new Error(`AppsFlyer API error: ${response.status} - ${errorText}`);
      }

      const conversionData = await response.json();
      console.log('Retrieved AppsFlyer conversion data:', conversionData);
      
      return conversionData as AppsFlyerConversionData;
    } catch (error) {
      console.error('Failed to get AppsFlyer conversion data:', error);
      return null;
    }
  }

  /**
   * Get conversion data for a customer user ID
   */
  async getConversionDataByCustomerId(customerUserId: string): Promise<AppsFlyerConversionData | null> {
    try {
      if (!this.apiToken || !this.appId) {
        throw new Error('AppsFlyer API token or App ID not configured');
      }

      const response = await fetch(
        `${this.baseUrl}/conversion_data/${this.appId}?customer_user_id=${customerUserId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No conversion data found for customer user ID:', customerUserId);
          return null;
        }
        const errorText = await response.text();
        throw new Error(`AppsFlyer API error: ${response.status} - ${errorText}`);
      }

      const conversionData = await response.json();
      console.log('Retrieved AppsFlyer conversion data by customer ID:', conversionData);
      
      return conversionData as AppsFlyerConversionData;
    } catch (error) {
      console.error('Failed to get AppsFlyer conversion data by customer ID:', error);
      return null;
    }
  }

  /**
   * Validate AppsFlyer configuration
   */
  isConfigured(): boolean {
    return !!(this.apiToken && this.appId);
  }

  /**
   * Get AppsFlyer attribution data for a specific device
   */
  async getAttributionData(
    deviceId: string,
    deviceType: 'idfa' | 'idfv' | 'android_id' | 'advertising_id' = 'idfa'
  ): Promise<AppsFlyerConversionData | null> {
    try {
      if (!this.apiToken || !this.appId) {
        throw new Error('AppsFlyer API token or App ID not configured');
      }

      const response = await fetch(
        `${this.baseUrl}/attribution_data/${this.appId}?${deviceType}=${deviceId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No attribution data found for device:', deviceId);
          return null;
        }
        const errorText = await response.text();
        throw new Error(`AppsFlyer API error: ${response.status} - ${errorText}`);
      }

      const attributionData = await response.json();
      console.log('Retrieved AppsFlyer attribution data:', attributionData);
      
      return attributionData as AppsFlyerConversionData;
    } catch (error) {
      console.error('Failed to get AppsFlyer attribution data:', error);
      return null;
    }
  }

  /**
   * Track custom event with validation
   */
  async trackCustomEvent(
    eventName: string,
    eventData: Record<string, any>,
    validateEvent: boolean = true
  ): Promise<AppsFlyerApiResponse> {
    if (validateEvent && !this.isValidEventName(eventName)) {
      return {
        success: false,
        message: 'Invalid event name. Event names should be lowercase and contain only letters, numbers, and underscores.',
      };
    }

    return this.trackEvent(eventName, eventData);
  }

  /**
   * Validate event name format
   */
  private isValidEventName(eventName: string): boolean {
    const eventNameRegex = /^[a-z][a-z0-9_]*$/;
    return eventNameRegex.test(eventName);
  }
}