/*
::neup.documentation::logica-neupid-auth-module
::title Logica NeupID Authentication Helpers

::public

Use `checkNeupAuthentication()` to check whether an `auth_account` session is currently authenticated.

::public end

::private

On `neupgroup.com`, the helper calls the account auth endpoint from the client with browser credentials. On other domains, callers must pass the `auth_account` cookie value so it can be forwarded in request headers.

::private end

::end
*/

import { APP_BASE_PATH } from '@/core/appconfig';
import { runNeupBridgeApi, type NeupBridgeResponse } from '@/logica/neupid/api';

type AuthCheckBody = {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
};

export type CheckNeupAuthenticationInput = {
  authAccountToken?: string | null;
  workingProfile?: string | null;
  hostname?: string | null;
  headers?: HeadersInit;
};

export type CheckNeupAuthenticationResult<TBody = AuthCheckBody> =
  | {
      authenticated: true;
      response: NeupBridgeResponse<TBody>;
    }
  | {
      authenticated: false;
      reason: string;
      response?: NeupBridgeResponse<TBody>;
    };

const AUTH_ME_PATH = '/bridge/api.v1/auth/me';

function getRuntimeHostname(inputHostname?: string | null): string {
  if (inputHostname?.trim()) return inputHostname.trim().toLowerCase();
  if (typeof window === 'undefined') return '';
  return window.location.hostname.toLowerCase();
}

function isNeupGroupHostname(hostname: string): boolean {
  return hostname === 'neupgroup.com' || hostname.endsWith('.neupgroup.com');
}

function createAuthMePath(workingProfile?: string | null): string {
  const path = `${APP_BASE_PATH}${AUTH_ME_PATH}`;
  const query = new URLSearchParams();
  const normalizedWorkingProfile = workingProfile?.trim();

  if (normalizedWorkingProfile) {
    query.set('workingProfile', normalizedWorkingProfile);
  }

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

function isAuthenticatedResponse(response: NeupBridgeResponse<AuthCheckBody>): boolean {
  return response.ok && response.body?.success === true;
}

async function runClientAuthCheck<TBody = AuthCheckBody>(
  input: CheckNeupAuthenticationInput,
): Promise<NeupBridgeResponse<TBody>> {
  const response = await fetch(createAuthMePath(input.workingProfile), {
    method: 'GET',
    credentials: 'include',
    headers: input.headers,
    cache: 'no-store',
  });

  return {
    ok: response.ok,
    status: response.status,
    body: (await parseJsonResponse(response)) as TBody,
    headers: response.headers,
  };
}

async function runForwardedAuthCheck<TBody = AuthCheckBody>(
  input: CheckNeupAuthenticationInput,
): Promise<NeupBridgeResponse<TBody>> {
  const authAccountToken = input.authAccountToken?.trim();
  const headers = new Headers(input.headers);

  if (authAccountToken) {
    headers.set('x-auth-account', authAccountToken);
  }

  return runNeupBridgeApi<TBody>({
    path: AUTH_ME_PATH,
    method: 'GET',
    query: {
      workingProfile: input.workingProfile,
    },
    headers,
    authAccountToken,
  });
}

/*
::neup.documentation::check-neup-authentication
::function checkNeupAuthentication(input)

Checks whether a Neup account session is authenticated.

::public

When running in a browser on `neupgroup.com`, this function calls `/account/bridge/api.v1/auth/me` with browser credentials. On other domains, pass `authAccountToken` so the account cookie can be forwarded to the bridge endpoint.

::public end

::param external authAccountToken
::datatype string
::required false

The raw `auth_account` cookie value to forward when the caller is not running on `neupgroup.com`.

::end
*/
export async function checkNeupAuthentication<TBody = AuthCheckBody>(
  input: CheckNeupAuthenticationInput = {},
): Promise<CheckNeupAuthenticationResult<TBody>> {
  const hostname = getRuntimeHostname(input.hostname);
  const shouldUseClientEndpoint = typeof window !== 'undefined' && isNeupGroupHostname(hostname);

  if (!shouldUseClientEndpoint && !input.authAccountToken?.trim()) {
    return { authenticated: false, reason: 'missing_auth_account_token' };
  }

  const response = shouldUseClientEndpoint
    ? await runClientAuthCheck<TBody>(input)
    : await runForwardedAuthCheck<TBody>(input);

  if (isAuthenticatedResponse(response as NeupBridgeResponse<AuthCheckBody>)) {
    return { authenticated: true, response };
  }

  return {
    authenticated: false,
    reason: response.ok ? 'not_authenticated' : `api_status_${response.status}`,
    response,
  };
}

export const isNeupAuthenticated = checkNeupAuthentication;
