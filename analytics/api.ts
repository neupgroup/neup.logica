/*
::neup.documentation::logica-analytics-api-module
::title Logica Analytics API Runner

Shared API request runner for analytics bridge helpers.

::public

Use `requestAnalyticsApi()` for analytics bridge endpoints exposed by this app.

::public end

::end
*/

import { api, type ApiMethod, type ApiQuery, type ApiResponse } from '@/.neup/core/infrastructure/api';
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

  const request = api.atPath(url.web.path(analyticsBaseUrl).addPath(options.path).get());
  if (options.method) request.usingMethod(options.method);
  if (options.body != null) request.addData(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
  for (const [key, value] of new Headers(options.headers).entries()) request.addHeader(`${key}: ${value}`);
  if (options.bearerToken) request.addHeader(`authorization: Bearer ${options.bearerToken}`);
  if (options.authAccountToken) request.addHeader(`cookie: auth_account=${options.authAccountToken}`);
  return (await request.run().run()).getResponse<TBody>();
}
