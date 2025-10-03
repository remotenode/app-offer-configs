// Core data types for the app offer configuration system

export interface AppsFlyerData {
  af_id: string;
  af_status: 'Organic' | 'Non-organic';
  is_first_launch: boolean;
  install_time: string;
  click_time: string;
  campaign: string;
  media_source: string;
  adset?: string;
  af_adset?: string;
  adgroup?: string;
  campaign_id?: string;
  agency?: string;
  af_sub1?: string;
  af_sub2?: string;
  af_sub3?: string;
  af_sub4?: string;
  af_sub5?: string;
  af_siteid?: string;
  adset_id?: string;
  adgroup_id?: string;
  ad_id?: string;
  is_fb?: boolean;
  is_paid?: boolean;
  is_mobile_data_terms_signed?: boolean;
  af_channel?: string;
  iscache?: boolean;
  is_retargeting?: boolean;
  // Allow for additional dynamic fields
  [key: string]: any;
}

export interface AppConfig {
  bundleId: string;
  storeId: string;
  platform: 'Android' | 'iOS';
  locale: string;
  firebaseProjectId: string;
  pushToken: string;
}

export interface OfferConfig {
  url: string;
  expires: number;
  showWebView: boolean;
  notificationSettings: {
    enabled: boolean;
    customIcon?: string;
    imageSupport: boolean;
  };
  appSettings: {
    allowRotation: boolean;
    safeAreaSupport: boolean;
    javascriptEnabled: boolean;
    cookieSupport: boolean;
    sessionSupport: boolean;
    autoplayVideo: boolean;
    protectedContent: boolean;
    fileUpload: boolean;
  };
}

export interface ConfigRequest extends AppsFlyerData, AppConfig {}

export interface ConfigResponse {
  ok: boolean;
  url?: string;
  expires?: number;
  message?: string;
  config?: OfferConfig;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  event: string;
  data: {
    bundleId: string;
    afId: string;
    platform: string;
    responseTime: number;
    cacheHit: boolean;
    error?: string;
    userAgent?: string;
    ip?: string;
  };
}


export interface CacheEntry<T> {
  data: T;
  expires: number;
  created: number;
}

// Environment variables interface
export interface Env {
  CONFIG_CACHE: KVNamespace;
  CLOUDFLARE_API_TOKEN: string;
  FIREBASE_SERVICE_ACCOUNT_KEY: string;
  APPSFLYER_API_TOKEN: string;
  ADMIN_API_KEY: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
}