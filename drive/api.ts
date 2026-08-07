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

import { runApi, type ApiMethod, type ApiQuery, type ApiResponse } from '@/core/infrastructure/api';
import baseJson from '@/logica/base.json';

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
    baseUrl: baseJson.drive,
    path: options.path,
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
