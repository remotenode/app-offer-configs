export interface Env {
  ENVIRONMENT?: string;
  APPSFLYER_API_TOKEN?: string;
  APPSFLYER_APP_ID?: string;
  APPSFLYER_BASE_URL?: string;
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