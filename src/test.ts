// Simple test file to verify the implementation
import { describe, it, expect } from 'vitest';
import { validateConfigRequest, isNonOrganicInstall } from './utils/validation';
import { AppsFlyerService } from './services/appsflyer';
import { FirebaseService } from './services/firebase';

describe('App Offer Configuration Worker', () => {
  describe('Validation', () => {
    it('should validate a correct config request', () => {
      const validRequest = {
        af_id: '1688042316289-7152592750959506765',
        bundle_id: 'com.example.app',
        os: 'Android',
        store_id: 'com.example.app',
        locale: 'en',
        push_token: 'dl28EJCAT4a7UNl86egX-U:APA91bEC1a5aGJL8ZyQHlm-B9togw60MLWP4_zU0ExSXLSa_HiL82Iurj0d-1zJmkMdUcvgCRXTrXtbWQHxmJh49BibLiqZVXPNyrCdZW-_ROTt98f0WCLtt531RYPhWSDOkykcaykE3',
        firebase_project_id: '8934278530',
        af_status: 'Non-organic',
        is_first_launch: true,
        campaign: 'Test Campaign',
        media_source: 'Facebook Ads',
      };

      const result = validateConfigRequest(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject invalid config request', () => {
      const invalidRequest = {
        af_id: '', // Empty af_id should fail
        bundle_id: 'com.example.app',
        os: 'InvalidOS', // Invalid OS should fail
        store_id: 'com.example.app',
        locale: 'en',
        push_token: 'invalid-token',
        firebase_project_id: '8934278530',
      };

      const result = validateConfigRequest(invalidRequest);
      expect(result.success).toBe(false);
      expect(result.error).toContain('AppsFlyer ID is required');
    });
  });

  describe('AppsFlyer Service', () => {
    const appsFlyerService = new AppsFlyerService('test-token');

    it('should detect non-organic installs', () => {
      const nonOrganicRequest = {
        af_id: '1688042316289-7152592750959506765',
        bundle_id: 'com.example.app',
        os: 'Android' as const,
        store_id: 'com.example.app',
        locale: 'en',
        push_token: 'test-token',
        firebase_project_id: '8934278530',
        af_status: 'Non-organic' as const,
        is_first_launch: true,
      };

      const isNonOrganic = appsFlyerService.isNonOrganicInstall(nonOrganicRequest);
      expect(isNonOrganic).toBe(true);
    });

    it('should detect organic installs', () => {
      const organicRequest = {
        af_id: '1688042316289-7152592750959506765',
        bundle_id: 'com.example.app',
        os: 'Android' as const,
        store_id: 'com.example.app',
        locale: 'en',
        push_token: 'test-token',
        firebase_project_id: '8934278530',
        af_status: 'Organic' as const,
        is_first_launch: false,
      };

      const isNonOrganic = appsFlyerService.isNonOrganicInstall(organicRequest);
      expect(isNonOrganic).toBe(false);
    });

    it('should calculate quality score', () => {
      const highQualityRequest = {
        af_id: '1688042316289-7152592750959506765',
        bundle_id: 'com.example.app',
        os: 'Android' as const,
        store_id: 'com.example.app',
        locale: 'en',
        push_token: 'test-token',
        firebase_project_id: '8934278530',
        af_status: 'Non-organic' as const,
        is_first_launch: true,
        is_paid: true,
        media_source: 'Facebook Ads',
      };

      const qualityScore = appsFlyerService.getConversionQuality(highQualityRequest);
      expect(qualityScore).toBeGreaterThan(80);
    });
  });

  describe('Firebase Service', () => {
    const firebaseService = new FirebaseService('test-key', 'test-project');

    it('should validate Firebase project ID', () => {
      expect(firebaseService.validateProjectId('8934278530')).toBe(true);
      expect(firebaseService.validateProjectId('invalid-id')).toBe(false);
    });

    it('should validate push token format', () => {
      const validToken = 'dl28EJCAT4a7UNl86egX-U:APA91bEC1a5aGJL8ZyQHlm-B9togw60MLWP4_zU0ExSXLSa_HiL82Iurj0d-1zJmkMdUcvgCRXTrXtbWQHxmJh49BibLiqZVXPNyrCdZW-_ROTt98f0WCLtt531RYPhWSDOkykcaykE3';
      const invalidToken = 'short-token';

      expect(firebaseService.validatePushToken(validToken)).toBe(true);
      expect(firebaseService.validatePushToken(invalidToken)).toBe(false);
    });

    it('should determine notification eligibility', () => {
      const eligibleRequest = {
        af_id: '1688042316289-7152592750959506765',
        bundle_id: 'com.example.app',
        os: 'Android' as const,
        store_id: 'com.example.app',
        locale: 'en',
        push_token: 'dl28EJCAT4a7UNl86egX-U:APA91bEC1a5aGJL8ZyQHlm-B9togw60MLWP4_zU0ExSXLSa_HiL82Iurj0d-1zJmkMdUcvgCRXTrXtbWQHxmJh49BibLiqZVXPNyrCdZW-_ROTt98f0WCLtt531RYPhWSDOkykcaykE3',
        firebase_project_id: '8934278530',
        af_status: 'Non-organic' as const,
      };

      const isEligible = firebaseService.isEligibleForNotifications(eligibleRequest);
      expect(isEligible).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('should detect non-organic installs correctly', () => {
      const nonOrganicData = {
        af_id: '1688042316289-7152592750959506765',
        bundle_id: 'com.example.app',
        os: 'Android' as const,
        store_id: 'com.example.app',
        locale: 'en',
        push_token: 'test-token',
        firebase_project_id: '8934278530',
        af_status: 'Non-organic' as const,
      };

      expect(isNonOrganicInstall(nonOrganicData)).toBe(true);
    });
  });
});