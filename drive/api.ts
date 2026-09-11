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

import { runApi, type ApiMethod, type ApiQuery, type ApiResponse } from '@/.neup/core/infrastructure/api';
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
  return runApi<TBody>({
    baseUrl: new URL(getBaseUrl('drive')).origin,
    path: url.web.path(getBaseUrl('drive')).addPath(options.path).get(),
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
