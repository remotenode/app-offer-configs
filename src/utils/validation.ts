import { z } from 'zod';
import { ConfigRequest, ConfigResponse } from '../types';

// Base AppsFlyer data schema
const appsFlyerDataSchema = z.object({
  af_id: z.string().min(1, 'AppsFlyer ID is required'),
  af_status: z.enum(['Organic', 'Non-organic']).optional(),
  is_first_launch: z.boolean().optional(),
  install_time: z.string().optional(),
  click_time: z.string().optional(),
  campaign: z.string().optional(),
  media_source: z.string().optional(),
  adset: z.string().optional(),
  af_adset: z.string().optional(),
  adgroup: z.string().optional(),
  campaign_id: z.string().optional(),
  agency: z.string().optional(),
  af_sub1: z.string().optional(),
  af_sub2: z.string().optional(),
  af_sub3: z.string().optional(),
  af_sub4: z.string().optional(),
  af_sub5: z.string().optional(),
  af_siteid: z.string().optional(),
  adset_id: z.string().optional(),
  adgroup_id: z.string().optional(),
  ad_id: z.string().optional(),
  is_fb: z.boolean().optional(),
  is_paid: z.boolean().optional(),
  is_mobile_data_terms_signed: z.boolean().optional(),
  af_channel: z.string().optional(),
  iscache: z.boolean().optional(),
  is_retargeting: z.boolean().optional(),
});

// App configuration schema
const appConfigSchema = z.object({
  bundle_id: z.string().min(1, 'Bundle ID is required'),
  os: z.enum(['Android', 'iOS'], { 
    errorMap: () => ({ message: 'OS must be either Android or iOS' })
  }),
  store_id: z.string().min(1, 'Store ID is required'),
  locale: z.string().min(1, 'Locale is required'),
  push_token: z.string().min(1, 'Push token is required'),
  firebase_project_id: z.string().min(1, 'Firebase project ID is required'),
});

// Complete request schema
export const configRequestSchema = appsFlyerDataSchema.merge(appConfigSchema).passthrough();

// Response schema
export const configResponseSchema = z.object({
  ok: z.boolean(),
  url: z.string().url().optional(),
  expires: z.number().positive().optional(),
  message: z.string().optional(),
  config: z.object({
    url: z.string().url(),
    expires: z.number().positive(),
    showWebView: z.boolean(),
    notificationSettings: z.object({
      enabled: z.boolean(),
      customIcon: z.string().optional(),
      imageSupport: z.boolean(),
    }),
    appSettings: z.object({
      allowRotation: z.boolean(),
      safeAreaSupport: z.boolean(),
      javascriptEnabled: z.boolean(),
      cookieSupport: z.boolean(),
      sessionSupport: z.boolean(),
      autoplayVideo: z.boolean(),
      protectedContent: z.boolean(),
      fileUpload: z.boolean(),
    }),
  }).optional(),
});

// Validation functions
export function validateConfigRequest(data: unknown): { success: true; data: ConfigRequest } | { success: false; error: string } {
  try {
    const validatedData = configRequestSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid request data' };
  }
}

export function validateConfigResponse(data: unknown): { success: true; data: ConfigResponse } | { success: false; error: string } {
  try {
    const validatedData = configResponseSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid response data' };
  }
}

// Helper function to check if request is for non-organic install
export function isNonOrganicInstall(data: ConfigRequest): boolean {
  return data.af_status === 'Non-organic' || data.is_first_launch === true;
}

// Helper function to extract key identifiers
export function extractIdentifiers(data: ConfigRequest) {
  return {
    bundleId: data.bundle_id,
    afId: data.af_id,
    platform: data.os,
    storeId: data.store_id,
    locale: data.locale,
  };
}