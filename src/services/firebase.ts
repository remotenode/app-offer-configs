import { ConfigRequest, OfferConfig } from '../types';

export class FirebaseService {
  private serviceAccountKey: string;
  private projectId: string;

  constructor(serviceAccountKey: string, projectId: string) {
    this.serviceAccountKey = serviceAccountKey;
    this.projectId = projectId;
  }

  // Validate Firebase project ID
  validateProjectId(projectId: string): boolean {
    // Firebase project IDs are typically numeric strings
    return /^\d+$/.test(projectId);
  }

  // Validate push token format
  validatePushToken(token: string): boolean {
    // Firebase FCM tokens have a specific format
    // They typically contain colons and are quite long
    return token.length > 50 && token.includes(':');
  }

  // Register device for push notifications
  async registerDevice(data: ConfigRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate required fields
      if (!this.validateProjectId(data.firebase_project_id)) {
        return { success: false, error: 'Invalid Firebase project ID' };
      }

      if (!this.validatePushToken(data.push_token)) {
        return { success: false, error: 'Invalid push token format' };
      }

      // In a real implementation, you would:
      // 1. Store the push token in your database
      // 2. Associate it with the AppsFlyer ID
      // 3. Set up notification preferences
      
      // For now, we'll just validate and return success
      console.log(`Device registered: ${data.af_id} with token: ${data.push_token.substring(0, 20)}...`);
      
      return { success: true };
    } catch (error) {
      console.error('Error registering device:', error);
      return { success: false, error: 'Failed to register device' };
    }
  }

  // Get notification configuration for the app
  getNotificationConfig(data: ConfigRequest): OfferConfig['notificationSettings'] {
    // Determine notification settings based on app and platform
    const isAndroid = data.os === 'Android';
    
    return {
      enabled: true,
      customIcon: isAndroid ? 'notification_icon' : undefined, // Android only
      imageSupport: true,
    };
  }

  // Check if notifications should be requested
  shouldRequestNotifications(data: ConfigRequest): boolean {
    // Only request notifications for non-organic installs
    // This matches the business logic from your documentation
    return data.af_status === 'Non-organic' || data.is_first_launch === true;
  }

  // Get app-specific notification settings
  getAppNotificationSettings(bundleId: string, platform: string): {
    requestOnFirstLaunch: boolean;
    retryAfterDays: number;
    customIcon?: string;
    imageSupport: boolean;
  } {
    // Default settings
    const defaultSettings = {
      requestOnFirstLaunch: true,
      retryAfterDays: 3,
      imageSupport: true,
    };

    // Platform-specific settings
    if (platform === 'Android') {
      return {
        ...defaultSettings,
        customIcon: 'notification_icon',
      };
    }

    return defaultSettings;
  }

  // Validate notification payload (for sending notifications)
  validateNotificationPayload(payload: any): { valid: boolean; error?: string } {
    try {
      if (!payload.message) {
        return { valid: false, error: 'Missing message object' };
      }

      if (!payload.message.token) {
        return { valid: false, error: 'Missing push token' };
      }

      if (!payload.message.notification) {
        return { valid: false, error: 'Missing notification object' };
      }

      if (!payload.message.notification.title) {
        return { valid: false, error: 'Missing notification title' };
      }

      if (!payload.message.notification.body) {
        return { valid: false, error: 'Missing notification body' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid notification payload' };
    }
  }

  // Get Firebase project configuration
  getProjectConfig(): {
    projectId: string;
    messagingSenderId: string;
    appId: string;
  } {
    return {
      projectId: this.projectId,
      messagingSenderId: this.projectId, // Usually the same as project ID
      appId: `1:${this.projectId}:web:${this.generateAppId()}`,
    };
  }

  // Generate a simple app ID (in real implementation, this would come from Firebase console)
  private generateAppId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Get notification topics for the app
  getNotificationTopics(bundleId: string): string[] {
    return [
      `app_${bundleId}`,
      `platform_${bundleId}`,
      `all_apps`,
    ];
  }

  // Check if device is eligible for notifications
  isEligibleForNotifications(data: ConfigRequest): boolean {
    // Check if push token is valid
    if (!this.validatePushToken(data.push_token)) {
      return false;
    }

    // Check if Firebase project ID is valid
    if (!this.validateProjectId(data.firebase_project_id)) {
      return false;
    }

    // Check if this is a non-organic install (business rule)
    if (data.af_status === 'Organic') {
      return false;
    }

    return true;
  }
}