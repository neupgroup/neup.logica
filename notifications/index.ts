/*
::neup.documentation::logica-notifications-object
::title Logica Notifications Object API

::public

Use `logica.notifications.get()` for application notifications,
`logica.notifications.filter({...}).get()` for an account or connection, and
`logica.notifications.wildcard().get()` for all notifications when the current
application is internal.

::public end

::end
*/

import {
  getNotifications,
  isInternalNotificationApplication,
  type NotificationFilter,
  type NotificationsResponseBody,
} from '@/logica/notifications/api';
import { getNeupBridgeEnvironment, type NeupBridgeResponse } from '@/logica/account/api';

type NotificationsResponse = NeupBridgeResponse<NotificationsResponseBody>;

function emptyWildcardResponse(): NotificationsResponse {
  return {
    ok: true,
    status: 204,
    body: {
      success: true,
      data: [],
      meta: { ignored: true, reason: 'wildcard_requires_internal_application' },
    },
    headers: new Headers(),
  };
}

function getWildcard(input: NotificationFilter = {}): Promise<NotificationsResponse> {
  const application = input.application?.trim() || getNeupBridgeEnvironment().appId;
  if (!isInternalNotificationApplication(application)) return Promise.resolve(emptyWildcardResponse());
  return getNotifications({ ...input, accountId: undefined, connectionId: undefined });
}

export const notifications = {
  get(input: NotificationFilter = {}): Promise<NotificationsResponse> {
    return getNotifications(input);
  },

  filter(input: NotificationFilter = {}) {
    return {
      get(): Promise<NotificationsResponse> {
        return getNotifications(input);
      },
    } as const;
  },

  wildcard(input: NotificationFilter = {}) {
    return {
      get(): Promise<NotificationsResponse> {
        return getWildcard(input);
      },
    } as const;
  },
} as const;

export { getNotifications } from '@/logica/notifications/api';
export type { NotificationFilter, NotificationRecord, NotificationsResponseBody } from '@/logica/notifications/api';

export default notifications;

