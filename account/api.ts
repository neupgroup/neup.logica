/*
::neup.documentation::logica-neupid-api-module
::title Logica NeupID Bridge API

NeupID bridge configuration and request helpers.

::public

Use this module to read Neup bridge credentials and execute Neup bridge requests
through the generic core API runner.

::public end

::private

Endpoint-agnostic request execution lives in `@neup/core/infrastructure/api`.

::private end

::end
*/

import {
  Api,
  type ApiMethod,
  type ApiQuery,
  type ApiResponse,
} from '@/.neup/core/infrastructure/api';
import { getEnvVariable } from '@neup/core/helpers/env';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';

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

function getNeupBridgeBaseUrl(): string {
  return getBaseUrl('neupid');
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
  const requestUrl = new URL(url.web.path(getNeupBridgeBaseUrl()).addPath(options.path).get());
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== null && value !== undefined && value !== '') {
      requestUrl.searchParams.set(key, String(value));
    }
  }
  const request = new Api().atPath(requestUrl.toString());
  if (options.method) request.usingMethod(options.method);
  if (options.body != null) request.addData(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
  for (const [key, value] of new Headers(options.headers).entries()) request.addHeader(`${key}: ${value}`);
  if (options.bearerToken) request.addHeader(`authorization: Bearer ${options.bearerToken}`);
  if (options.authAccountToken) request.addHeader(`cookie: auth_account=${options.authAccountToken}`);
  // Execute the configured request through the shared fluent API runner.
  const apiResponse = await request.run();

  // Return the typed response produced by the account bridge endpoint.
  return apiResponse as ApiResponse<TBody>;
}
