/*
::neup.documentation::logica-notifications-api
::title Logica Notifications API

::public

Shared notification bridge helpers. Application credentials are resolved from
`NEUP_APP_ID` and `NEUP_APP_SECRET` unless explicitly overridden.

::public end

::end
*/

import {
  getNeupBridgeEnvironment,
  runNeupBridgeApi,
  type NeupBridgeResponse,
} from '@/logica/account/api';

export type NotificationCredentials = {
  application?: string | null;
  appsecret?: string | null;
};

export type NotificationFilter = NotificationCredentials & {
  accountId?: string | null;
  connectionId?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export type NotificationRecord = {
  id: string;
  accountId: string;
  applicationId: string | null;
  action: string | null;
  title: string | null;
  message: string | null;
  type: string;
  read: boolean;
  createdAt: string;
  deletableOn: string | null;
  persistence: string | null;
  detail: unknown;
};

export type NotificationsResponseBody = {
  success: boolean;
  data: NotificationRecord[];
  meta?: Record<string, unknown>;
  error?: string;
  error_description?: string;
};

function getCredentials(input: NotificationCredentials = {}): { application: string; appsecret: string } {
  const environment = getNeupBridgeEnvironment();
  const application = input.application?.trim() || environment.appId;
  const appsecret = input.appsecret?.trim() || environment.appSecret;
  return { application, appsecret };
}

function headers(input: NotificationCredentials): HeadersInit {
  const credentials = getCredentials(input);
  return {
    'x-application-id': credentials.application,
    'x-app-secret': credentials.appsecret,
  };
}

export function getNotifications(
  input: NotificationFilter = {},
): Promise<NeupBridgeResponse<NotificationsResponseBody>> {
  return runNeupBridgeApi<NotificationsResponseBody>({
    path: '/bridge/api.v1/notification',
    method: 'GET',
    query: {
      accountId: input.accountId,
      connectionId: input.connectionId,
      limit: input.limit,
      offset: input.offset,
    },
    headers: headers(input),
  });
}

export function isInternalNotificationApplication(application: string): boolean {
  return application.trim().startsWith('neup.');
}

