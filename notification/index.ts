/*
::neup.documentation::logica-notification-object
::title Logica Notification API

::public

Use `logica.notification.get()` for application notifications,
`logica.notification.filter({...}).get()` for an account or connection,
`logica.notification.wildcard().get()` for notifications across application
scopes, optionally filtered by account, when the configured application has
party 0 (internal), and
`logica.notification.data({...})` for mutations.

Credentials default to `NEUP_APP_ID` and `NEUP_APP_SECRET`. Override them with
`notification({ application, appsecret })`.

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
  mode?: 'wildcard' | null;
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

type NotificationsResponse = NeupBridgeResponse<NotificationsResponseBody>;
type NotificationMutationResponse = NeupBridgeResponse<NotificationMutationBody>;

function resolveCredentials(input: NotificationCredentials = {}): { application: string; appsecret: string } {
  const environment = getNeupBridgeEnvironment();
  return {
    application: input.application?.trim() || environment.appId,
    appsecret: input.appsecret?.trim() || environment.appSecret,
  };
}

function credentialHeaders(input: NotificationCredentials): HeadersInit {
  const credentials = resolveCredentials(input);
  return {
    application: credentials.application,
    appsecret: credentials.appsecret,
  };
}

function getNotifications(input: NotificationFilter = {}): Promise<NotificationsResponse> {
  return runNeupBridgeApi<NotificationsResponseBody>({
    path: '/bridge/api.v1/notification',
    method: 'GET',
    query: {
      accountId: input.accountId,
      connectionId: input.connectionId,
      mode: input.mode,
      limit: input.limit,
      offset: input.offset,
    },
    headers: credentialHeaders(input),
  });
}

function getWildcard(input: NotificationFilter = {}): Promise<NotificationsResponse> {
  return getNotifications({ ...input, mode: 'wildcard', connectionId: undefined });
}

function createNotification(data: NotificationCreateData): Promise<NotificationMutationResponse> {
  const { application, appsecret, description, message, dismissable, disimssable, ...payload } = data;
  return runNeupBridgeApi<NotificationMutationBody>({
    path: '/bridge/api.v1/notification',
    method: 'POST',
    headers: credentialHeaders({ application, appsecret }),
    body: {
      ...payload,
      message: message ?? description,
      type: payload.type ?? 'informative',
      persistence: disimssable ?? dismissable,
    },
  });
}

function readNotification(data: NotificationReadData): Promise<NotificationMutationResponse> {
  const { application, appsecret, ...payload } = data;
  return runNeupBridgeApi<NotificationMutationBody>({
    path: '/bridge/api.v1/notification',
    method: 'PATCH',
    headers: credentialHeaders({ application, appsecret }),
    body: { ...payload, action: data.action ?? 'read' },
  });
}

function createScope(credentialsOverride: NotificationCredentials = {}) {
  return {
    get(input: NotificationFilter = {}): Promise<NotificationsResponse> {
      return getNotifications({ ...input, ...credentialsOverride });
    },
    filter(input: NotificationFilter = {}) {
      return { get: () => getNotifications({ ...input, ...credentialsOverride }) } as const;
    },
    wildcard(input: NotificationFilter = {}) {
      return { get: () => getWildcard({ ...input, ...credentialsOverride }) } as const;
    },
    data(data: NotificationCreateData | NotificationReadData) {
      const merged = { ...credentialsOverride, ...data };
      return {
        create: () => createNotification(merged as NotificationCreateData),
        read: () => readNotification(merged as NotificationReadData),
      } as const;
    },
  } as const;
}

export const notification = Object.assign(
  (credentialsOverride: NotificationCredentials = {}) => createScope(credentialsOverride),
  createScope(),
);

export type NotificationObject = ReturnType<typeof createScope>;
export default notification;
