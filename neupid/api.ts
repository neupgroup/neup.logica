/*
::neup.documentation::logica-neupid-api-module
::title Logica NeupID Bridge API

NeupID bridge configuration and request helpers.

::public

Use this module to read Neup bridge credentials and execute Neup bridge requests
through the generic core API runner.

::public end

::private

Endpoint-agnostic request execution lives in `@/core/infrastructure/api`.

::private end

::end
*/

import {
  createApiUrl,
  runApi,
  type ApiMethod,
  type ApiQuery,
  type ApiResponse,
} from '@/core/infrastructure/api';
import baseJson from '@/logica/base.json';

export type NeupBridgeEnvironment = {
  appId: string;
  appSecret: string;
  authUrl: string;
};

export type NeupBridgeMethod = ApiMethod;

export type NeupBridgeQuery = ApiQuery;

export type NeupBridgeResponse<TBody = unknown> = ApiResponse<TBody>;

export type NeupBridgeRequestOptions = {
  path: string;
  method?: NeupBridgeMethod;
  query?: NeupBridgeQuery;
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  headers?: HeadersInit;
  authAccountToken?: string | null;
  bearerToken?: string | null;
};

function requireEnv(name: 'NEUP_APP_ID' | 'NEUP_APP_SECRET'): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function requireBaseJsonUrl(name: 'neupid'): string {
  const value = baseJson[name]?.trim();
  if (!value) {
    throw new Error(`logica/base.json ${name} is required.`);
  }
  return value;
}

function getNeupBridgeBaseUrl(): string {
  return requireBaseJsonUrl('neupid');
}

export function getNeupBridgeEnvironment(): NeupBridgeEnvironment {
  return {
    appId: requireEnv('NEUP_APP_ID'),
    appSecret: requireEnv('NEUP_APP_SECRET'),
    authUrl: getNeupBridgeBaseUrl(),
  };
}

export function createNeupBridgeUrl(path: string, query?: NeupBridgeQuery): string {
  return createApiUrl(getNeupBridgeBaseUrl(), path, query);
}

export async function runNeupBridgeApi<TBody = unknown>(
  options: NeupBridgeRequestOptions,
): Promise<NeupBridgeResponse<TBody>> {
  return runApi<TBody>({
    baseUrl: getNeupBridgeBaseUrl(),
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
