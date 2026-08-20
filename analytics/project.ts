/*
::neup.documentation::logica-analytics-project-object
::title Logica Analytics Project Object

Project-scoped analytics SDK helpers.

::public

Use `logica.analytics.project(projectId).postActivity(data)` to push activity
events into `POST /bridge/api.v1/activity?project=...`.

::public end

::end
*/

import { requestAnalyticsApi, type AnalyticsApiResponse } from '@/logica/analytics/api';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type AnalyticsActivityInput = {
  id?: string;
  identifier?: string;
  identifierId?: string;
  type?: string;
  timespent?: number;
  timeSpent?: number;
  activityOn?: string | Date;
  moreDetails?: JsonValue;
  agent?: JsonValue;
  location?: JsonValue;
  ip?: string;
  userAgent?: string;
  pageUrl?: string;
  referral?: string;
};

export type PostActivityResponseBody = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

export function project(projectId: string) {
  const normalizedProjectId = projectId.trim();

  return {
    /*
    ::neup.documentation::logica-analytics-project-post-activity-function
    ::function postActivity(activity)

    Sends one or many activity events to the analytics bridge.

    ::public

    Accepted fields per event:
    - `identifier` or `identifierId`: required visitor identifier.
    - `type`: activity type such as `pageview`.
    - `timespent` or `timeSpent`: integer time spent value.
    - `activityOn`: ISO datetime string or `Date`.
    - `pageUrl`: page URL for the activity.
    - `userAgent`: raw user agent string.
    - `ip`: source IP when forwarding manually.
    - `referral`: referrer URL.
    - `agent`: JSON details about the agent/client.
    - `location`: JSON details about location.
    - `moreDetails`: arbitrary JSON payload.
    - `id`: optional event id. When omitted, the API generates one.

    The target project id is supplied by `logica.analytics.project(projectId)`.

    ::public end

    ::end
    */
    postActivity(
      activity: AnalyticsActivityInput | AnalyticsActivityInput[],
    ): Promise<AnalyticsApiResponse<PostActivityResponseBody>> {
      return requestAnalyticsApi<PostActivityResponseBody>({
        path: '/bridge/api.v1/activity',
        method: 'POST',
        query: {
          project: normalizedProjectId,
        },
        body: activity,
      });
    },

    /*
    ::neup.documentation::logica-analytics-project-send-activity-function
    ::function sendActivity(activity)

    Sends one or many activity events to the analytics webhook endpoint.

    ::public

    Accepted fields per event are the same as `postActivity()`:
    - `identifier` or `identifierId`: required visitor identifier.
    - `type`: activity type such as `pageview`.
    - `timespent` or `timeSpent`: integer time spent value.
    - `activityOn`: ISO datetime string or `Date`.
    - `pageUrl`: page URL for the activity.
    - `userAgent`: raw user agent string.
    - `ip`: source IP when forwarding manually.
    - `referral`: referrer URL.
    - `agent`: JSON details about the agent/client.
    - `location`: JSON details about location.
    - `moreDetails`: arbitrary JSON payload.
    - `id`: optional event id. When omitted, the API generates one.

    The target project id is supplied by `logica.analytics.project(projectId)`.

    ::public end

    ::end
    */
    sendActivity(
      activity: AnalyticsActivityInput | AnalyticsActivityInput[],
    ): Promise<AnalyticsApiResponse<PostActivityResponseBody>> {
      return requestAnalyticsApi<PostActivityResponseBody>({
        path: '/bride/webhook.v1/activity',
        method: 'POST',
        query: {
          project: normalizedProjectId,
        },
        body: activity,
      });
    },
  } as const;
}

export type AnalyticsProjectScope = ReturnType<typeof project>;
