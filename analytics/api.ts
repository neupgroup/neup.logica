/*
::neup.documentation::logica-analytics-api-module
::title Logica Analytics API Runner

Shared API request runner for analytics bridge helpers.

::public

Use `requestAnalyticsApi()` for analytics bridge endpoints exposed by this app.

::public end

::end
*/

import { runApi, type ApiMethod, type ApiQuery, type ApiResponse } from '#/core/infrastructure/api';
import { url } from '#/core/helpers/link/url';
import baseJson from '#/logica/base.json';

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
  const value = baseJson.analytics?.trim();

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
    path: url().setBasePath(analyticsBaseUrl).addCustomPath(options.path).get(),
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
