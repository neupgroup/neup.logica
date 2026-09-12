/*
::neup.documentation::logica-logger-api-module
::title Logica Logger API Runner

::public

Use `requestLoggerApi()` for logger bridge requests that do not need a more
specialized helper.

::public end

::end
*/

import {
  api,
  type ApiMethod,
  type ApiQuery,
  type ApiResponse,
} from '@/.neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';

export type LoggerApiMethod = ApiMethod;

export type LoggerApiQuery = ApiQuery;

export type LoggerApiResponse<TBody = unknown> = ApiResponse<TBody>;

export type LoggerApiRequestOptions = {
  path: string;
  method?: LoggerApiMethod;
  query?: LoggerApiQuery;
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  headers?: HeadersInit;
  bearerToken?: string | null;
};

function getLoggerBaseUrl() {
  const value = getBaseUrl('cloud');

  if (!value) {
    throw new Error('logica/base.json cloud is required.');
  }

  return value;
}

function getLoggerOrigin() {
  return new URL(getLoggerBaseUrl()).origin;
}

export function createLoggerUrl(path: string, query?: LoggerApiQuery): string {
  const result = new URL(url.web.path(getLoggerBaseUrl()).addPath(path).get(), getLoggerOrigin());
  for (const [key, value] of Object.entries(query ?? {})) if (value != null && value !== '') result.searchParams.set(key, String(value));
  return result.toString();
}

export async function requestLoggerApi<TBody = unknown>(
  options: LoggerApiRequestOptions,
): Promise<LoggerApiResponse<TBody>> {
  const request = api.atPath(url.web.path(getLoggerBaseUrl()).addPath(options.path).get());
  if (options.method) request.usingMethod(options.method);
  if (options.body != null) request.addData(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
  for (const [key, value] of new Headers(options.headers).entries()) request.addHeader(`${key}: ${value}`);
  if (options.bearerToken) request.addHeader(`authorization: Bearer ${options.bearerToken}`);
  return (await request.run()) as ApiResponse<TBody>;
}
