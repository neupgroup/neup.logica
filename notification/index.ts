/*
::neup.documentation::logica-notification-object
::title Logica Notification Mutation API

::public

Use `logica.notification.data({...}).create()` to create a notification and
`logica.notification.data({ notificationId }).read()` to read or dismiss one.
Credentials default to `NEUP_APP_ID` and `NEUP_APP_SECRET`; pass
`notification({ application, appsecret })` to override them.

::public end

::end
*/

import {
  getNeupBridgeEnvironment,
  runNeupBridgeApi,
  type NeupBridgeResponse,
} from '@/logica/account/api';
import type { NotificationCredentials, NotificationRecord } from '@/logica/notifications/api';

export type NotificationCreateData = NotificationCredentials & {
  accountId?: string | null;
  connectionId?: string | null;
  title?: string | null;
  description?: string | null;
  message?: string | null;
  action?: string | null;
  dismissable?: boolean;
  disimssable?: boolean;
  type?: 'warning' | 'error' | 'informative' | 'success';
};

export type NotificationReadData = NotificationCredentials & {
  notificationId: string;
  accountId?: string | null;
  connectionId?: string | null;
  action?: 'read' | 'dismiss';
};

type NotificationMutationBody = {
  success: boolean;
  notification?: NotificationRecord;
  error?: string;
  error_description?: string;
};

function credentials(input: NotificationCredentials): HeadersInit {
  const environment = getNeupBridgeEnvironment();
  return {
    'x-application-id': input.application?.trim() || environment.appId,
    'x-app-secret': input.appsecret?.trim() || environment.appSecret,
  };
}

function createNotification(data: NotificationCreateData): Promise<NeupBridgeResponse<NotificationMutationBody>> {
  const { application, appsecret, description, message, dismissable, disimssable, ...payload } = data;
  return runNeupBridgeApi<NotificationMutationBody>({
    path: '/bridge/api.v1/notification',
    method: 'POST',
    headers: credentials({ application, appsecret }),
    body: {
      ...payload,
      message: message ?? description,
      type: payload.type ?? 'informative',
      persistence: disimssable ?? dismissable,
    },
  });
}

function readNotification(data: NotificationReadData): Promise<NeupBridgeResponse<NotificationMutationBody>> {
  const { application, appsecret, ...payload } = data;
  return runNeupBridgeApi<NotificationMutationBody>({
    path: '/bridge/api.v1/notification',
    method: 'PATCH',
    headers: credentials({ application, appsecret }),
    body: {
      ...payload,
      action: data.action ?? 'read',
    },
  });
}

export function notification(credentialsOverride: NotificationCredentials = {}) {
  return {
    data(data: NotificationCreateData | NotificationReadData) {
      return {
        create(): Promise<NeupBridgeResponse<NotificationMutationBody>> {
          return createNotification({ ...credentialsOverride, ...data } as NotificationCreateData);
        },
        read(): Promise<NeupBridgeResponse<NotificationMutationBody>> {
          return readNotification({ ...credentialsOverride, ...data } as NotificationReadData);
        },
      } as const;
    },
  } as const;
}

notification.data = function data(input: NotificationCreateData | NotificationReadData) {
  return notification().data(input);
};

export type NotificationObject = ReturnType<typeof notification>;
export default notification;
