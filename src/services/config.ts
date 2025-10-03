import { ConfigRequest, ConfigResponse, OfferConfig } from '../types';
import { AppsFlyerService } from './appsflyer';
import { FirebaseService } from './firebase';

export class ConfigService {
  private appsFlyerService: AppsFlyerService;
  private firebaseService: FirebaseService;

  constructor(appsFlyerToken: string, firebaseKey: string, firebaseProjectId: string) {
    this.appsFlyerService = new AppsFlyerService(appsFlyerToken);
    this.firebaseService = new FirebaseService(firebaseKey, firebaseProjectId);
  }

  // Main configuration processing method
  async processConfigRequest(data: ConfigRequest): Promise<ConfigResponse> {
    try {
      // Validate AppsFlyer data
      const validation = this.appsFlyerService.validateConversionData(data);
      if (!validation.valid) {
        return {
          ok: false,
          message: validation.error || 'Invalid conversion data',
        };
      }

      // Check if this is a non-organic install
      const isNonOrganic = this.appsFlyerService.isNonOrganicInstall(data);
      
      if (!isNonOrganic) {
        // For organic installs, return negative response
        return {
          ok: false,
          message: 'No data',
        };
      }

      // Register device for notifications if eligible
      if (this.firebaseService.isEligibleForNotifications(data)) {
        const registration = await this.firebaseService.registerDevice(data);
        if (!registration.success) {
          console.warn('Failed to register device for notifications:', registration.error);
        }
      }

      // Generate offer configuration
      const offerConfig = await this.generateOfferConfig(data);
      
      return {
        ok: true,
        url: offerConfig.url,
        expires: offerConfig.expires,
        config: offerConfig,
      };

    } catch (error) {
      console.error('Error processing config request:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  // Generate offer configuration based on request data
  private async generateOfferConfig(data: ConfigRequest): Promise<OfferConfig> {
    // Get campaign information
    const campaignInfo = this.appsFlyerService.extractCampaignInfo(data);
    const qualityScore = this.appsFlyerService.getConversionQuality(data);

    // Generate offer URL based on campaign and quality
    const offerUrl = this.generateOfferUrl(data, campaignInfo, qualityScore);
    
    // Set expiration time (24 hours from now)
    const expires = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

    // Get notification settings
    const notificationSettings = this.firebaseService.getNotificationConfig(data);

    // Get app settings based on platform
    const appSettings = this.getAppSettings(data.os);

    return {
      url: offerUrl,
      expires,
      showWebView: true,
      notificationSettings,
      appSettings,
    };
  }

  // Generate offer URL based on campaign data
  private generateOfferUrl(
    data: ConfigRequest, 
    campaignInfo: ReturnType<AppsFlyerService['extractCampaignInfo']>,
    qualityScore: number
  ): string {
    // Base URL - this would be configured per app/campaign
    const baseUrl = this.getBaseUrlForApp(data.bundle_id);
    
    // Create URL with campaign parameters
    const url = new URL(baseUrl);
    
    // Add AppsFlyer parameters
    url.searchParams.set('af_id', data.af_id);
    url.searchParams.set('bundle_id', data.bundle_id);
    url.searchParams.set('os', data.os);
    url.searchParams.set('locale', data.locale);
    
    // Add campaign parameters
    if (campaignInfo.campaign) {
      url.searchParams.set('campaign', campaignInfo.campaign);
    }
    if (campaignInfo.mediaSource) {
      url.searchParams.set('media_source', campaignInfo.mediaSource);
    }
    if (campaignInfo.adset) {
      url.searchParams.set('adset', campaignInfo.adset);
    }
    if (campaignInfo.agency) {
      url.searchParams.set('agency', campaignInfo.agency);
    }
    
    // Add quality score for tracking
    url.searchParams.set('quality_score', qualityScore.toString());
    
    // Add timestamp
    url.searchParams.set('timestamp', Date.now().toString());
    
    return url.toString();
  }

  // Get base URL for specific app
  private getBaseUrlForApp(bundleId: string): string {
    // This would typically come from a configuration or database
    // For now, we'll use a default test URL
    const appUrls: Record<string, string> = {
      'com.example.app': 'https://test-web.syndi-test.net/',
      // Add more app URLs as needed
    };

    return appUrls[bundleId] || 'https://test-web.syndi-test.net/';
  }

  // Get app-specific settings based on platform
  private getAppSettings(platform: string): OfferConfig['appSettings'] {
    const baseSettings = {
      allowRotation: true,
      safeAreaSupport: true,
      javascriptEnabled: true,
      cookieSupport: true,
      sessionSupport: true,
      autoplayVideo: true,
      protectedContent: true,
      fileUpload: true,
    };

    // Platform-specific adjustments
    if (platform === 'iOS') {
      return {
        ...baseSettings,
        // iOS-specific settings if needed
      };
    } else if (platform === 'Android') {
      return {
        ...baseSettings,
        // Android-specific settings if needed
      };
    }

    return baseSettings;
  }

  // Get configuration summary for logging
  getConfigSummary(data: ConfigRequest, response: ConfigResponse): {
    bundleId: string;
    afId: string;
    platform: string;
    isNonOrganic: boolean;
    hasOffer: boolean;
    qualityScore: number;
    campaignInfo: ReturnType<AppsFlyerService['extractCampaignInfo']>;
  } {
    return {
      bundleId: data.bundle_id,
      afId: data.af_id,
      platform: data.os,
      isNonOrganic: this.appsFlyerService.isNonOrganicInstall(data),
      hasOffer: response.ok && !!response.url,
      qualityScore: this.appsFlyerService.getConversionQuality(data),
      campaignInfo: this.appsFlyerService.extractCampaignInfo(data),
    };
  }

  // Validate request against business rules
  validateBusinessRules(data: ConfigRequest): { valid: boolean; reason?: string } {
    // Check if bundle ID is allowed
    if (!this.isBundleIdAllowed(data.bundle_id)) {
      return { valid: false, reason: 'Bundle ID not allowed' };
    }

    // Check if platform is supported
    if (!['Android', 'iOS'].includes(data.os)) {
      return { valid: false, reason: 'Unsupported platform' };
    }

    // Check if locale is supported
    if (!this.isLocaleSupported(data.locale)) {
      return { valid: false, reason: 'Unsupported locale' };
    }

    return { valid: true };
  }

  // Check if bundle ID is in allowed list
  private isBundleIdAllowed(bundleId: string): boolean {
    const allowedBundles = [
      'com.example.app',
      // Add more allowed bundle IDs as needed
    ];
    
    return allowedBundles.includes(bundleId);
  }

  // Check if locale is supported
  private isLocaleSupported(locale: string): boolean {
    const supportedLocales = [
      'en', 'en_US', 'en_GB',
      'ru', 'ru_RU',
      'es', 'es_ES',
      'fr', 'fr_FR',
      'de', 'de_DE',
      'it', 'it_IT',
      'pt', 'pt_BR',
      'ja', 'ja_JP',
      'ko', 'ko_KR',
      'zh', 'zh_CN',
    ];
    
    return supportedLocales.includes(locale);
  }
}