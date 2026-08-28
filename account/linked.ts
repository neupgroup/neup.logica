/*
::neup.documentation::logica-account-linked-module
::title Logica Account Linked Helpers

Helpers for reading linked third-party account tokens for the current account session.

::public

Use `logica.account.linked.github.get()` to fetch the latest encrypted GitHub linked-account token for the current authenticated account.

::public end

::private

This module resolves the current `auth_account` token from browser or server context, then calls the bridge endpoint that validates the session and returns the encrypted linked-account token payload.

::private end

::end
*/

import { runNeupBridgeApi, type NeupBridgeResponse } from '#/logica/account/api';

/*
::neup.documentation::logica-account-linked-github-response-body-type
::type LinkedGithubResponseBody

Bridge response body for the linked GitHub token helper.

::public

Contains the success state, encrypted token payload, and standard bridge error fields.

::public end

::end
*/
export type LinkedGithubResponseBody = {
  success?: boolean;
  platform?: string;
  token?: string;
  error?: string;
  error_description?: string;
};

async function getServerAuthAccountToken(): Promise<string | null> {
  if (typeof window !== 'undefined') return null;

  try {
    const { getCookie } = await import('#/core/helpers/cookie');
    return (await getCookie('auth_account'))?.trim() || null;
  } catch {
    return null;
  }
}

function getBrowserAuthAccountToken(): string | null {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('auth_account='));

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice('auth_account='.length)).trim() || null;
  } catch {
    return cookie.slice('auth_account='.length).trim() || null;
  }
}

async function resolveAuthAccountToken(authAccountToken?: string | null): Promise<string | null> {
  return authAccountToken?.trim() || getBrowserAuthAccountToken() || await getServerAuthAccountToken();
}

/*
::neup.documentation::logica-account-get-linked-github-token-function
::function getLinkedGithubToken(authAccountToken)

Returns the latest encrypted linked GitHub token for the current account session.

::public

When `authAccountToken` is omitted, the helper automatically reads the current `auth_account` cookie from the browser or current server request context.

::public end

::param external authAccountToken
::datatype string
::required false

Explicit auth token override. When omitted, the helper resolves the current `auth_account` cookie automatically.

::end
*/
export async function getLinkedGithubToken(
  authAccountToken?: string | null,
): Promise<NeupBridgeResponse<LinkedGithubResponseBody>> {
  const token = await resolveAuthAccountToken(authAccountToken);

  if (!token) {
    return {
      ok: false,
      status: 401,
      body: {
        success: false,
        error: 'missing_auth_account_token',
        error_description: 'auth_account token is required.',
      },
      headers: new Headers(),
    };
  }

  return runNeupBridgeApi<LinkedGithubResponseBody>({
    path: '/bridge/api.v1/accounts/linked/github',
    method: 'POST',
    body: {
      token,
    },
  });
}

/*
::neup.documentation::logica-account-linked-object
::function linked

Linked third-party account child object for `logica.account`.

::public

Use `logica.account.linked.github.get()` to read the latest encrypted GitHub linked-account token for the current caller session.

::public end

::end
*/
export const linked = {
  github: {
    get(authAccountToken?: string | null) {
      return getLinkedGithubToken(authAccountToken);
    },
  },
} as const;
