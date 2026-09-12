/*
::neup.documentation::logica-drive-api-module
::title Logica Drive API Runner

Shared API request runner for portable drive SDK helpers.

::public

Use `requestDriveApi()` for drive API endpoints that do not need a specialized
helper.

::public end

::end
*/

import { api, type ApiMethod, type ApiQuery, type ApiResponse } from '@/.neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';

export type DriveApiMethod = ApiMethod;

export type DriveApiQuery = ApiQuery;

export type DriveApiResponse<TBody = unknown> = ApiResponse<TBody>;

export type DriveApiRequestOptions = {
  path: string;
  method?: DriveApiMethod;
  query?: DriveApiQuery;
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  headers?: HeadersInit;
  authAccountToken?: string | null;
  bearerToken?: string | null;
};

export async function requestDriveApi<TBody = unknown>(
  options: DriveApiRequestOptions,
): Promise<DriveApiResponse<TBody>> {
  const request = api.atPath(url.web.path(getBaseUrl('drive')).addPath(options.path).get());
  if (options.method) request.usingMethod(options.method);
  if (options.body != null) request.addData(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
  for (const [key, value] of new Headers(options.headers).entries()) request.addHeader(`${key}: ${value}`);
  if (options.bearerToken) request.addHeader(`authorization: Bearer ${options.bearerToken}`);
  if (options.authAccountToken) request.addHeader(`cookie: auth_account=${options.authAccountToken}`);
  return (await request.run()) as ApiResponse<TBody>;
}
