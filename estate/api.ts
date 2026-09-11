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

import { api, type ApiMethod, type ApiQuery, type ApiResponse } from '@/.neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';

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
  const request = api.atPath(url.web.path(getBaseUrl('estate')).addPath(options.path).get());
  if (options.method) request.usingMethod(options.method);
  if (options.body != null) request.addData(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
  for (const [key, value] of new Headers(options.headers).entries()) request.addHeader(`${key}: ${value}`);
  if (options.bearerToken) request.addHeader(`authorization: Bearer ${options.bearerToken}`);
  if (options.authAccountToken) request.addHeader(`cookie: auth_account=${options.authAccountToken}`);
  return (await request.run().run()).getResponse<TBody>();
}
