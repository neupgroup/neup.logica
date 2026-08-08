/*
::neup.documentation::logica-neupid-auth-module
::title Logica NeupID Authentication Helpers

::public

Use `checkAuthSession()` to check whether an `auth_account` session is currently authenticated.

::public end

::private

On `neupgroup.com`, the helper calls the account auth endpoint from the client with browser credentials. On other domains, callers may pass the `auth_account` cookie value, or server-side calls can read it from the current request cookies before forwarding it to the account bridge.

::private end

::end
*/

import { url } from '@/core/helpers/link/url';
import { runNeupBridgeApi, type NeupBridgeResponse } from '@/logica/account/api';
import baseJson from '@/logica/base.json';
import {
  authenticateNeupIdToken,
  type AuthenticateNeupIdTokenResult,
} from '@/logica/account/token/authenticate';
import { verifyNeupIdToken } from '@/logica/account/token/verify';

type AuthCheckBody = {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
};

/*
::neup.documentation::logica-account-check-neup-authentication-input-type
::type CheckNeupAuthenticationInput

Input for checking the current account authentication session.

::public

Carries optional auth-account token, selected working profile, hostname, and
headers used by `checkAuthSession`.

::public end

::end
*/
export type CheckNeupAuthenticationInput = {
  authAccountToken?: string | null;
  workingProfile?: string | null;
  hostname?: string | null;
  headers?: HeadersInit;
};

/*
::neup.documentation::logica-account-check-neup-authentication-result-type
::type CheckNeupAuthenticationResult

Result of an account authentication session check.

::public

Returns either an authenticated response wrapper or a rejected state with a
reason and optional bridge response.

::public end

::end
*/
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
  const path = url().setBasePath(baseJson.neupid).addCustomPath(AUTH_ME_PATH).get();
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
  authAccountToken: string,
): Promise<NeupBridgeResponse<TBody>> {
  const headers = new Headers(input.headers);

  headers.set('x-auth-account', authAccountToken);

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

async function getServerAuthAccountToken(): Promise<string | null> {
  if (typeof window !== 'undefined') return null;

  try {
    const { getCookie } = await import('@/core/helpers/cookie');
    return (await getCookie('auth_account'))?.trim() || null;
  } catch {
    return null;
  }
}

async function resolveAuthAccountToken(
  input: CheckNeupAuthenticationInput,
): Promise<string | null> {
  return input.authAccountToken?.trim() || await getServerAuthAccountToken();
}

/*
::neup.documentation::check-auth-session
::function checkAuthSession(input)

Checks whether a Neup account session is authenticated.

::public

When running in a browser on `neupgroup.com`, this function calls the app-scoped auth endpoint built from `APP_BASEPATH` and `/bridge/api.v1/auth/me` with browser credentials. On other domains, it forwards the explicit `authAccountToken`, or reads `auth_account` from the current server request cookies when called server-side.

::public end

::param external authAccountToken
::datatype string
::required false

The raw `auth_account` cookie value to forward when the caller is not running on `neupgroup.com`. When omitted in a server context, the helper reads the current request cookie automatically.

::end
*/
export async function checkAuthSession<TBody = AuthCheckBody>(
  input: CheckNeupAuthenticationInput = {},
): Promise<CheckNeupAuthenticationResult<TBody>> {
  const hostname = getRuntimeHostname(input.hostname);
  const shouldUseClientEndpoint = typeof window !== 'undefined' && isNeupGroupHostname(hostname);
  let response: NeupBridgeResponse<TBody>;

  if (shouldUseClientEndpoint) {
    response = await runClientAuthCheck<TBody>(input);
  } else {
    const authAccountToken = await resolveAuthAccountToken(input);

    if (!authAccountToken) {
      return { authenticated: false, reason: 'missing_auth_account_token' };
    }

    response = await runForwardedAuthCheck<TBody>(input, authAccountToken);
  }

  if (isAuthenticatedResponse(response as NeupBridgeResponse<AuthCheckBody>)) {
    return { authenticated: true, response };
  }

  return {
    authenticated: false,
    reason: response.ok ? 'not_authenticated' : `api_status_${response.status}`,
    response,
  };
}

/*
::neup.documentation::logica-account-is-authenticated-function
::function isAuthenticated(input)

Alias for `checkAuthSession`.

::public

Use this when call-site language reads better as an authentication predicate.

::public end

::end
*/
export const isAuthenticated = checkAuthSession;

/*
::neup.documentation::logica-account-auth-object
::function auth

Authentication child object for `logica.account.auth`.

::public

Exposes session check, authentication predicate, token authentication, and token
verification through the account object tree.

::public end

::end
*/
export const auth = {
  check(input: CheckNeupAuthenticationInput = {}) {
    return checkAuthSession(input);
  },

  isAuthenticated(input: CheckNeupAuthenticationInput = {}) {
    return isAuthenticated(input);
  },

  authenticate<TBody = unknown>(
    token: string | null | undefined,
    options: Parameters<typeof authenticateNeupIdToken>[1] = {},
  ): Promise<AuthenticateNeupIdTokenResult<TBody>> {
    return authenticateNeupIdToken<TBody>(token, options);
  },

  verify: verifyNeupIdToken,
} as const;
