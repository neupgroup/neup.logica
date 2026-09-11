/*
::neup.documentation::logica-analytics-api-module
::title Logica Analytics API Runner

Shared API request runner for analytics bridge helpers.

::public

Use `requestAnalyticsApi()` for analytics bridge endpoints exposed by this app.

::public end

::end
*/

import { runApi, type ApiMethod, type ApiQuery, type ApiResponse } from '@/.neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';

export type AnalyticsApiMethod = ApiMethod;

export type AnalyticsApiQuery = ApiQuery;

export type AnalyticsApiResponse<TBody = unknown> = ApiResponse<TBody>;

export type AnalyticsApiRequestOptions = {
  path: string;
  method?: AnalyticsApiMethod;
  query?: AnalyticsApiQuery;
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  headers?: HeadersInit;
  bearerToken?: string | null;
  authAccountToken?: string | null;
};

function requireAnalyticsBaseUrl(): string {
  const value = getBaseUrl('analytics');

  if (!value) {
    throw new Error('logica/base.json analytics is required.');
  }

  return value;
}

export async function requestAnalyticsApi<TBody = unknown>(
  options: AnalyticsApiRequestOptions,
): Promise<AnalyticsApiResponse<TBody>> {
  const analyticsBaseUrl = requireAnalyticsBaseUrl();

  return runApi<TBody>({
    baseUrl: new URL(analyticsBaseUrl).origin,
    path: url.web.path(analyticsBaseUrl).addPath(options.path).get(),
    method: options.method,
    query: options.query,
    body: options.body,
    headers: options.headers,
    bearerToken: options.bearerToken,
    cookies: {
      auth_account: options.authAccountToken,
    },
  });
}
