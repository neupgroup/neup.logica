/*
::neup.documentation::logica-estate-api-module
::title Logica Estate API Runner

Shared API request runner for portable estate SDK helpers.

::public

Use `requestEstateApi()` for estate API endpoints that do not need a
specialized helper.

::public end

::end
*/

import { runApi, type ApiMethod, type ApiQuery, type ApiResponse } from '@/core/infrastructure/api';
import { url } from '@/core/helpers/link/url';
import baseJson from '@/logica/estate/base.json';

export type EstateApiMethod = ApiMethod;

export type EstateApiQuery = ApiQuery;

export type EstateApiResponse<TBody = unknown> = ApiResponse<TBody>;

export type EstateApiRequestOptions = {
  path: string;
  method?: EstateApiMethod;
  query?: EstateApiQuery;
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  headers?: HeadersInit;
  authAccountToken?: string | null;
  bearerToken?: string | null;
};

export async function requestEstateApi<TBody = unknown>(
  options: EstateApiRequestOptions,
): Promise<EstateApiResponse<TBody>> {
  return runApi<TBody>({
    baseUrl: new URL(baseJson.baseEndpoint).origin,
    path: url().setBasePath(baseJson.baseEndpoint).addCustomPath(options.path).get(),
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
