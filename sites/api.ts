/*
::neup.documentation::logica-sites-api-module
::title Logica Sites API Runner

Shared API request runner for sites bridge helpers.

::public

Use `requestSitesApi()` for sites bridge endpoints exposed by this app.

::public end

::end
*/

import { runApi, type ApiMethod, type ApiQuery, type ApiResponse } from '#/core/infrastructure/api';
import { url } from '#/core/helpers/link/url';
import baseJson from '#/logica/base.json';

export type SitesApiMethod = ApiMethod;

export type SitesApiQuery = ApiQuery;

export type SitesApiResponse<TBody = unknown> = ApiResponse<TBody>;

export type SitesApiRequestOptions = {
  path: string;
  method?: SitesApiMethod;
  query?: SitesApiQuery;
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  headers?: HeadersInit;
  bearerToken?: string | null;
  authAccountToken?: string | null;
};

function requireSitesBaseUrl(): string {
  const value = baseJson.sites?.trim();

  if (!value) {
    throw new Error('logica/base.json sites is required.');
  }

  return value;
}

export async function requestSitesApi<TBody = unknown>(
  options: SitesApiRequestOptions,
): Promise<SitesApiResponse<TBody>> {
  const sitesBaseUrl = requireSitesBaseUrl();
  const requestUrl = url().setBasePath(sitesBaseUrl).addCustomPath(options.path).get();

  return runApi({
    baseUrl: new URL(sitesBaseUrl).origin,
    path: requestUrl,
    method: options.method,
    query: options.query,
    body: options.body,
    headers: options.headers,
    bearerToken: options.bearerToken,
    cookies: {
      auth_account: options.authAccountToken,
    },
  }) as Promise<SitesApiResponse<TBody>>;
}
