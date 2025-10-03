import { AppsFlyerData, ConfigRequest } from '../types';

export class AppsFlyerService {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  // Validate AppsFlyer conversion data
  validateConversionData(data: AppsFlyerData): { valid: boolean; error?: string } {
    try {
      // Check required fields
      if (!data.af_id) {
        return { valid: false, error: 'AppsFlyer ID is required' };
      }

      // Validate af_status if present
      if (data.af_status && !['Organic', 'Non-organic'].includes(data.af_status)) {
        return { valid: false, error: 'Invalid af_status value' };
      }

      // Validate timestamps if present
      if (data.install_time && !this.isValidTimestamp(data.install_time)) {
        return { valid: false, error: 'Invalid install_time format' };
      }

      if (data.click_time && !this.isValidTimestamp(data.click_time)) {
        return { valid: false, error: 'Invalid click_time format' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid conversion data format' };
    }
  }

  // Check if installation is non-organic
  isNonOrganicInstall(data: ConfigRequest): boolean {
    // Primary check: af_status
    if (data.af_status === 'Non-organic') {
      return true;
    }

    // Secondary check: is_first_launch for non-organic
    if (data.is_first_launch === true && data.af_status !== 'Organic') {
      return true;
    }

    // Check for paid campaign indicators
    if (data.is_paid === true) {
      return true;
    }

    // Check for specific media sources that indicate non-organic
    const nonOrganicSources = [
      'Facebook Ads',
      'Google Ads',
      'TikTok Ads',
      'Snapchat Ads',
      'Twitter Ads',
      'LinkedIn Ads',
      'Unity Ads',
      'AppLovin',
      'IronSource',
      'Vungle',
      'AdMob',
      'AdColony'
    ];

    if (data.media_source && nonOrganicSources.includes(data.media_source)) {
      return true;
    }

    return false;
  }

  // Extract campaign information
  extractCampaignInfo(data: ConfigRequest): {
    campaign: string;
    mediaSource: string;
    adset: string;
    agency: string;
    isRetargeting: boolean;
  } {
    return {
      campaign: data.campaign || 'Unknown',
      mediaSource: data.media_source || 'Unknown',
      adset: data.adset || data.af_adset || 'Unknown',
      agency: data.agency || 'Unknown',
      isRetargeting: data.is_retargeting === true,
    };
  }

  // Generate unique identifier for this conversion
  generateConversionId(data: ConfigRequest): string {
    const timestamp = data.install_time || data.click_time || new Date().toISOString();
    const baseId = `${data.af_id}_${data.bundle_id}_${timestamp}`;
    
    // Create a simple hash-like identifier
    return btoa(baseId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  // Get conversion quality score (0-100)
  getConversionQuality(data: ConfigRequest): number {
    let score = 50; // Base score

    // Boost score for non-organic installs
    if (this.isNonOrganicInstall(data)) {
      score += 30;
    }

    // Boost score for first launch
    if (data.is_first_launch === true) {
      score += 20;
    }

    // Boost score for paid campaigns
    if (data.is_paid === true) {
      score += 15;
    }

    // Boost score for specific high-quality sources
    const highQualitySources = ['Facebook Ads', 'Google Ads', 'TikTok Ads'];
    if (data.media_source && highQualitySources.includes(data.media_source)) {
      score += 10;
    }

    // Reduce score for retargeting (lower intent)
    if (data.is_retargeting === true) {
      score -= 10;
    }

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score));
  }

  // Validate timestamp format
  private isValidTimestamp(timestamp: string): boolean {
    try {
      const date = new Date(timestamp);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }

  // Get conversion data summary for logging
  getConversionSummary(data: ConfigRequest): {
    afId: string;
    bundleId: string;
    platform: string;
    isNonOrganic: boolean;
    qualityScore: number;
    campaignInfo: ReturnType<typeof this.extractCampaignInfo>;
  } {
    return {
      afId: data.af_id,
      bundleId: data.bundle_id,
      platform: data.os,
      isNonOrganic: this.isNonOrganicInstall(data),
      qualityScore: this.getConversionQuality(data),
      campaignInfo: this.extractCampaignInfo(data),
    };
  }
}