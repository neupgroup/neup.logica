/*
::neup.documentation::logica-neupid-api-module
::title Logica NeupID Bridge API

NeupID bridge configuration and request helpers.

::public

Use this module to read Neup bridge credentials and execute Neup bridge requests
through the generic core API runner.

::public end

::private

Endpoint-agnostic request execution lives in `#/core/infrastructure/api`.

::private end

::end
*/

import {
  createApiUrl,
  runApi,
  type ApiMethod,
  type ApiQuery,
  type ApiResponse,
} from '#/core/infrastructure/api';
import { getEnvVariable } from '#/core/helpers/env';
import { url } from '#/core/helpers/link/url';
import baseJson from '#/logica/base.json';

/*
::neup.documentation::logica-account-neup-bridge-environment-type
::type NeupBridgeEnvironment

Resolved bridge runtime environment.

::public

Contains the application id, application secret, and account bridge base URL used
by account bridge requests.

::public end

::end
*/
export type NeupBridgeEnvironment = {
  appId: string;
  appSecret: string;
  authUrl: string;
};

/*
::neup.documentation::logica-account-neup-bridge-method-type
::type NeupBridgeMethod

HTTP method type accepted by account bridge requests.

::public

This aliases the shared core API method type.

::public end

::end
*/
export type NeupBridgeMethod = ApiMethod;

/*
::neup.documentation::logica-account-neup-bridge-query-type
::type NeupBridgeQuery

Query parameter shape accepted by account bridge requests.

::public

This aliases the shared core API query type.

::public end

::end
*/
export type NeupBridgeQuery = ApiQuery;

/*
::neup.documentation::logica-account-neup-bridge-response-type
::type NeupBridgeResponse

Bridge response wrapper returned by account helpers.

::public

Carries status, ok state, parsed body, and headers from the account bridge
request.

::public end

::end
*/
export type NeupBridgeResponse<TBody = unknown> = ApiResponse<TBody>;

/*
::neup.documentation::logica-account-neup-bridge-request-options-type
::type NeupBridgeRequestOptions

Options for one account bridge request.

::public

Provides path, method, query, body, headers, auth account cookie token, and
bearer token inputs for `runNeupBridgeApi`.

::public end

::end
*/
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
  const fallbackName = name.toLowerCase();
  const value = getEnvVariable(name) || process.env[fallbackName]?.trim();
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

function getNeupBridgeOrigin(): string {
  return new URL(getNeupBridgeBaseUrl()).origin;
}

/*
::neup.documentation::logica-account-get-neup-bridge-environment-function
::function getNeupBridgeEnvironment()

Reads account bridge environment configuration.

::public

Returns required `NEUP_APP_ID`, `NEUP_APP_SECRET`, and the base account bridge
URL from `logica/base.json`.

::public end

::end
*/
export function getNeupBridgeEnvironment(): NeupBridgeEnvironment {
  return {
    appId: requireEnv('NEUP_APP_ID'),
    appSecret: requireEnv('NEUP_APP_SECRET'),
    authUrl: getNeupBridgeBaseUrl(),
  };
}

/*
::neup.documentation::logica-account-create-neup-bridge-url-function
::function createNeupBridgeUrl(path, query)

Creates an absolute account bridge URL.

::public

Uses the configured account bridge base URL and appends the provided path and
query parameters.

::public end

::end
*/
export function createNeupBridgeUrl(path: string, query?: NeupBridgeQuery): string {
  return createApiUrl(
    getNeupBridgeOrigin(),
    url().setBasePath(getNeupBridgeBaseUrl()).addCustomPath(path).get(),
    query,
  );
}

/*
::neup.documentation::logica-account-run-neup-bridge-api-function
::function runNeupBridgeApi(options)

Executes one account bridge request.

::public

Wraps the shared core API runner with the account bridge base URL and account
cookie handling.

::public end

::end
*/
export async function runNeupBridgeApi<TBody = unknown>(
  options: NeupBridgeRequestOptions,
): Promise<NeupBridgeResponse<TBody>> {
  return runApi<TBody>({
    baseUrl: getNeupBridgeOrigin(),
    path: url().setBasePath(getNeupBridgeBaseUrl()).addCustomPath(options.path).get(),
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
