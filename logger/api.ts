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
  createApiUrl,
  runApi,
  type ApiMethod,
  type ApiQuery,
  type ApiResponse,
} from '#/core/infrastructure/api';
import { url } from '#/core/helpers/link/url';
import baseJson from '#/logica/base.json';

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
  const value = baseJson.cloud?.trim();

  if (!value) {
    throw new Error('logica/base.json cloud is required.');
  }

  return value;
}

function getLoggerOrigin() {
  return new URL(getLoggerBaseUrl()).origin;
}

export function createLoggerUrl(path: string, query?: LoggerApiQuery): string {
  return createApiUrl(
    getLoggerOrigin(),
    url().setBasePath(getLoggerBaseUrl()).addCustomPath(path).get(),
    query,
  );
}

export async function requestLoggerApi<TBody = unknown>(
  options: LoggerApiRequestOptions,
): Promise<LoggerApiResponse<TBody>> {
  return runApi<TBody>({
    baseUrl: getLoggerOrigin(),
    path: url().setBasePath(getLoggerBaseUrl()).addCustomPath(options.path).get(),
    method: options.method,
    query: options.query,
    body: options.body,
    headers: options.headers,
    bearerToken: options.bearerToken,
  });
}
