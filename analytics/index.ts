/*
::neup.documentation::logica-analytics-object-api
::title Logica Analytics Object API

Analytics object facade for project-scoped bridge helpers.

::public

Use `logica.analytics.project(projectId).postActivity(data)` to submit
activity events into this app's analytics bridge.

::public end

::end
*/

import { project } from '@/logica/analytics/project';

export const analytics = {
  project,
} as const;

export { project };
export { requestAnalyticsApi } from '@/logica/analytics/api';
export type {
  AnalyticsApiResponse,
} from '@/logica/analytics/api';
export type {
  AnalyticsActivityInput,
  AnalyticsProjectScope,
  PostActivityResponseBody,
} from '@/logica/analytics/project';

export default analytics;
