import { Env, NotificationRequest, NotificationPayload } from '../types';
import { DatabaseService } from '../services/database';

export class NotificationHandler {
  private databaseService: DatabaseService;

  constructor(private env: Env) {
    this.databaseService = new DatabaseService(env);
  }

  async sendNotification(request: Request): Promise<Response> {
    try {
      const notificationData: NotificationRequest = await request.json();
      
      // Validate required fields
      if (!notificationData.token || !notificationData.title || !notificationData.body) {
        return this.createErrorResponse('Missing required fields: token, title, body', 400);
      }

      // Store notification request
      await this.storeNotificationRequest(notificationData);

      // Send notification via Firebase
      const result = await this.sendFirebaseNotification(notificationData);

      if (result.success) {
        return this.createSuccessResponse({
          success: true,
          message: 'Notification sent successfully',
          notification_id: result.notification_id,
        });
      } else {
        return this.createErrorResponse(result.message || 'Failed to send notification', 500);
      }

    } catch (error) {
      console.error('Error sending notification:', error);
      return this.createErrorResponse('Internal server error', 500);
    }
  }

  async sendBulkNotifications(request: Request): Promise<Response> {
    try {
      const { tokens, title, body, image_url, icon_url, data } = await request.json();
      
      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        return this.createErrorResponse('Missing or invalid tokens array', 400);
      }

      if (!title || !body) {
        return this.createErrorResponse('Missing required fields: title, body', 400);
      }

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      // Send notifications to all tokens
      for (const token of tokens) {
        try {
          const notificationData: NotificationRequest = {
            token,
            title,
            body,
            image_url,
            icon_url,
            data,
          };

          const result = await this.sendFirebaseNotification(notificationData);
          
          if (result.success) {
            successCount++;
            await this.storeNotificationRequest(notificationData);
          } else {
            failureCount++;
          }

          results.push({
            token,
            success: result.success,
            message: result.message,
          });

        } catch (error) {
          failureCount++;
          results.push({
            token,
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return this.createSuccessResponse({
        success: true,
        message: `Notifications sent: ${successCount} successful, ${failureCount} failed`,
        results: results,
        summary: {
          total: tokens.length,
          successful: successCount,
          failed: failureCount,
        },
      });

    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      return this.createErrorResponse('Internal server error', 500);
    }
  }

  async getNotificationStats(): Promise<Response> {
    try {
      const pushTokenStats = await this.databaseService.getPushTokenStats();
      const requestStats = await this.databaseService.getMobilePhoneRequestStats();

      return this.createSuccessResponse({
        push_tokens: pushTokenStats,
        requests: requestStats,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Error getting notification stats:', error);
      return this.createErrorResponse('Failed to get notification stats', 500);
    }
  }

  private async sendFirebaseNotification(notificationData: NotificationRequest): Promise<{
    success: boolean;
    message?: string;
    notification_id?: string;
  }> {
    try {
      // In a real implementation, this would use Firebase Admin SDK
      // For now, we'll simulate the Firebase API call
      
      const payload: NotificationPayload = {
        message: {
          token: notificationData.token,
          notification: {
            title: notificationData.title,
            body: notificationData.body,
          },
          data: notificationData.data || {},
        },
      };

      // Add image and icon if provided
      if (notificationData.image_url) {
        payload.message.data.image = notificationData.image_url;
      }
      if (notificationData.icon_url) {
        payload.message.data.icon = notificationData.icon_url;
      }

      // Simulate Firebase API call
      console.log('Sending Firebase notification:', JSON.stringify(payload, null, 2));
      
      // In real implementation:
      // const response = await fetch('https://fcm.googleapis.com/v1/projects/{project-id}/messages:send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.env.FIREBASE_ACCESS_TOKEN}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(payload),
      // });

      // Simulate success
      return {
        success: true,
        message: 'Notification sent successfully',
        notification_id: `notification_${Date.now()}`,
      };

    } catch (error) {
      console.error('Failed to send Firebase notification:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async storeNotificationRequest(notificationData: NotificationRequest): Promise<void> {
    try {
      // Store as a mobile phone request with notification type
      await this.databaseService.storeMobilePhoneRequest({
        phone_number: 'notification_request', // Placeholder
        country_code: 'XX',
        request_type: 'notification',
        user_agent: 'Firebase Cloud Messaging',
        ip_address: 'unknown',
        timestamp: new Date().toISOString(),
        status: 'processed',
        metadata: {
          token: notificationData.token,
          title: notificationData.title,
          body: notificationData.body,
          image_url: notificationData.image_url,
          icon_url: notificationData.icon_url,
          data: notificationData.data,
        },
      });
    } catch (error) {
      console.error('Failed to store notification request:', error);
    }
  }

  private createSuccessResponse(data: any): Response {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  private createErrorResponse(message: string, status: number): Response {
    return new Response(JSON.stringify({
      success: false,
      message: message,
    }), {
      status: status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
