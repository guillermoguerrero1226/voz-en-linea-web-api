import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';
const webpush = require('web-push');

const vapidKeys = {
  publicKey:
    'BOlqHgIbhlB3vbNnJU_zdVMXNxpkC9_Plmhv7EKSAmWOoJKlcfkdwYt9dit3NmJoCYuIUda0bjjLd6b9q8SK_wc',
  privateKey: 'vXyRYLPLb1XUmVqP8qZjNt2ZULIYK6AqahzdN3qd9uw',
};

const options = {
  vapidDetails: {
    subject: 'mailto:guillermoguerrero1226@gmail.com',
    publicKey: vapidKeys.publicKey,
    privateKey: vapidKeys.privateKey,
  },
  TTL: 60,
};

export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_EVENT = 'NEW_EVENT',
}

type NotificationData = {
    type: NotificationType;
    body: string;
    url: string;
    sender: string;
  };

type NotitifacionPayload = {
  subscription: any;
  notificationData: NotificationData;
};

type WebPushNotificationInfo = {
  notification: {
    title: string;
    body: string;
    vibrate: any;
    icon: string;
    data: {
      onActionClick: {
        default: {
          operation: string;
          url: string;
        };
      };
    };
    tag: string;
    renotify: boolean;
  };
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async sendNotification(@Body() payload: NotitifacionPayload): Promise<any> {
    const response = {
        status: HttpStatus.OK,
        message: 'Se ha enviado la push notificacion correctamente',
        body: {}
    }
    try {
        const subscription = payload.subscription;
        const notificationData = payload.notificationData;
        const pushNotificationInfo = this.getNotificationInfo(notificationData);

        await this.sendPushNotification(subscription, pushNotificationInfo);
    } catch (error) {
        response.status = HttpStatus.INTERNAL_SERVER_ERROR,
        response.message = 'Ha ocurrido un error enviando la push notification',
        response.body = error
    }

    return response;
  }

   private async sendPushNotification(subscription, notificationInfo: string) {
    await webpush.sendNotification(subscription, notificationInfo, options);
  }

private getNotificationInfo(
    notificationData: NotificationData,
  ): string {
    const title = notificationData.type === NotificationType.NEW_MESSAGE
        ? '¡Tienes mensajes nuevos!'
        : '¡Hay un nuevo video o evento publicado!'

    const body = notificationData.type === NotificationType.NEW_MESSAGE
        ? `${notificationData.sender} te ha enviado un nuevo mensaje`
        : 'Entra a la app y míralo'

    const pushNotificationToSend: WebPushNotificationInfo = {
      notification: {
        title: title,
        body: body,
        vibrate: [200, 100, 200],
        icon: "https://lh3.googleusercontent.com/u/0/drive-viewer/AKGpihbjXMaNfI2Jr34txmRa0---zlLcBujWCAxMoJBmUAz8GGXxjf9Y3R_Vk9iXa97cyFekOxhmU1_ulah3krg_h6U0JKlJH5eZqg=w1920-h881",
        data: {
          onActionClick: {
            default: {
              operation: 'navigateLastFocusedOrOpen',
              url: notificationData.url,
            },
          },
        },
        tag: `new_message${notificationData.sender}`,
        renotify: true
      },
    };

    return JSON.stringify(pushNotificationToSend);
  }
}
