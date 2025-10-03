export interface Env {
  ENVIRONMENT?: string;
  APPSFLYER_API_TOKEN?: string;
  APPSFLYER_APP_ID?: string;
  APPSFLYER_BASE_URL?: string;
  DB: D1Database;
}

export interface AppsFlyerEventData {
  eventName: string;
  eventValue?: string | number;
  eventParameters?: Record<string, any>;
  customerUserId?: string;
  appsflyerId?: string;
  advertisingId?: string;
  idfa?: string;
  idfv?: string;
  timestamp?: number;
}

export interface AppsFlyerConversionData {
  status: string;
  type: string;
  media_source: string;
  campaign: string;
  campaign_id: string;
  adgroup: string;
  adgroup_id: string;
  adset: string;
  adset_id: string;
  ad: string;
  ad_id: string;
  ad_type: string;
  site_id: string;
  sub_site_id: string;
  sub_param1: string;
  sub_param2: string;
  sub_param3: string;
  sub_param4: string;
  sub_param5: string;
  click_time: string;
  install_time: string;
  is_first_launch: string;
  af_status: string;
  af_message: string;
  is_retargeting: string;
  retargeting_conversion_type: string;
  af_prt: string;
  af_c_id: string;
  af_adset_id: string;
  af_ad_id: string;
  af_ad_type: string;
  af_siteid: string;
  af_sub_siteid: string;
  af_sub_param_1: string;
  af_sub_param_2: string;
  af_sub_param_3: string;
  af_sub_param_4: string;
  af_sub_param_5: string;
  af_click_lookback: string;
  af_view_through_lookback: string;
  af_click_time: string;
  af_install_time: string;
  af_is_first_launch: string;
  af_status: string;
  af_message: string;
  af_is_retargeting: string;
  af_retargeting_conversion_type: string;
  af_prt: string;
  af_c_id: string;
  af_adset_id: string;
  af_ad_id: string;
  af_ad_type: string;
  af_siteid: string;
  af_sub_siteid: string;
  af_sub_param_1: string;
  af_sub_param_2: string;
  af_sub_param_3: string;
  af_sub_param_4: string;
  af_sub_param_5: string;
  af_click_lookback: string;
  af_view_through_lookback: string;
}

export interface AppsFlyerApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface MobilePhoneRequest {
  id?: number;
  phone_number: string;
  country_code: string;
  request_type: 'offer_config' | 'notification' | 'support' | 'other';
  user_agent?: string;
  ip_address?: string;
  timestamp: string;
  status: 'pending' | 'processed' | 'failed';
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface MobilePhoneRequestResponse {
  success: boolean;
  message?: string;
  data?: MobilePhoneRequest;
  request_id?: number;
}

export interface PushToken {
  id?: number;
  phone_number: string;
  push_token: string;
  platform: 'ios' | 'android' | 'web';
  app_version?: string;
  device_id?: string;
  is_active: boolean;
  last_used?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PushTokenResponse {
  success: boolean;
  message?: string;
  data?: PushToken;
  token_id?: number;
}

// Mobile App Configuration Types
export interface AppsFlyerConversionData {
  adset?: string;
  af_adset?: string;
  adgroup?: string;
  campaign_id?: string;
  af_status?: string;
  agency?: string;
  af_sub3?: string | null;
  af_siteid?: string | null;
  adset_id?: string;
  is_fb?: boolean;
  is_first_launch?: boolean;
  click_time?: string;
  iscache?: boolean;
  ad_id?: string;
  af_sub1?: string;
  campaign?: string;
  is_paid?: boolean;
  af_sub4?: string;
  adgroup_id?: string;
  is_mobile_data_terms_signed?: boolean;
  af_channel?: string;
  af_sub5?: string | null;
  media_source?: string;
  install_time?: string;
  af_sub2?: string | null;
}

export interface MobileAppConfigRequest {
  // AppsFlyer conversion data (all parameters from AppsFlyer)
  ...AppsFlyerConversionData;
  
  // Additional client data
  af_id: string; // AppsFlyer ID
  bundle_id: string; // Bundle ID or Package Name
  os: 'Android' | 'iOS'; // Platform
  store_id: string; // Store ID
  locale: string; // Device locale
  push_token?: string; // Firebase push token
  firebase_project_id?: string; // Firebase project ID
}

export interface MobileAppConfigResponse {
  ok: boolean;
  message?: string;
  url?: string; // URL for WebView
  expires?: number; // Expiration timestamp
}

export interface NotificationPayload {
  message: {
    token: string;
    notification: {
      title: string;
      body: string;
    };
    data: {
      url?: string;
    };
  };
}

export interface NotificationRequest {
  token: string;
  title: string;
  body: string;
  image_url?: string;
  icon_url?: string;
  data?: Record<string, string>;
}