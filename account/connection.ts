/*
::neup.documentation::logica-account-connection-module
::title Logica Connection Route Helpers

Portable wrappers for bridge connection sign-and-get helpers.

::public

Use this module when an app needs a normalized connected-account identity snapshot from `/bridge/api.v1/connection/sign&get`.

::public end

::end
*/

import { getNeupBridgeEnvironment, runNeupBridgeApi, type NeupBridgeResponse } from '#/logica/account/api';

/*
::neup.documentation::logica-account-neup-connection-account-info-type
::type NeupConnectionAccountInfo

Normalized current application connection identity.

::public

Contains account id, connection id, display name, and display image returned by
the connection sign-and-get flow.

::public end

::end
*/
export type NeupConnectionAccountInfo = {
  accountId: string;
  connectionId: string;
  displayName: string;
  displayImage: string | null;
};

type SignAndGetResponse = {
  success?: boolean;
  error?: string;
  account?: {
    id?: unknown;
    connectionId?: unknown;
  };
  profile?: {
    displayName?: unknown;
    displayImage?: unknown;
  };
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function parseNeupConnectionAccountInfo(body: SignAndGetResponse): NeupConnectionAccountInfo {
  const accountId = asNonEmptyString(body.account?.id);
  const connectionId = asNonEmptyString(body.account?.connectionId);
  const displayName = asNonEmptyString(body.profile?.displayName);
  const rawDisplayImage = body.profile?.displayImage;

  if (!accountId) {
    throw new Error('Bridge response is missing account.id. Configure the application response fields to include accountId.');
  }

  if (!connectionId) {
    throw new Error('Bridge response is missing account.connectionId.');
  }

  if (!displayName) {
    throw new Error('Bridge response is missing profile.displayName. Configure the application response fields to include displayName.');
  }

  if (rawDisplayImage !== null && rawDisplayImage !== undefined && typeof rawDisplayImage !== 'string') {
    throw new Error('Bridge response returned an invalid profile.displayImage value.');
  }

  return {
    accountId,
    connectionId,
    displayName,
    displayImage: typeof rawDisplayImage === 'string' ? rawDisplayImage : null,
  };
}

/*
::neup.documentation::logica-account-connect-current-account-function
::function connectCurrentAccount(authAccountToken)

Creates or fetches the current account's application connection.

::public

Uses the auth-account token and application credentials to call the bridge
`connection/sign&get` route.

::public end

::end
*/
export async function connectCurrentAccount(
  authAccountToken: string,
): Promise<NeupBridgeResponse<SignAndGetResponse>> {
  const token = authAccountToken.trim();
  if (!token) {
    throw new Error('authAccountToken is required.');
  }

  const env = getNeupBridgeEnvironment();
  return runNeupBridgeApi<SignAndGetResponse>({
    path: '/bridge/api.v1/connection/sign&get',
    method: 'POST',
    authAccountToken: token,
    body: {
      appId: env.appId,
      appSecret: env.appSecret,
    },
  });
}

/*
::neup.documentation::logica-account-get-current-application-account-function
::function getCurrentApplicationAccount(authAccountToken)

Returns normalized current application account connection info.

::public

Runs the current-account connection flow and validates the required identity
fields before returning them.

::public end

::end
*/
export async function getCurrentApplicationAccount(
  authAccountToken: string,
): Promise<NeupConnectionAccountInfo> {
  const response = await connectCurrentAccount(authAccountToken);
  const body = response.body;

  if (!response.ok) {
    const bridgeError = asNonEmptyString(body?.error) ?? `HTTP ${response.status}`;
    throw new Error(`Neup account bridge request failed: ${bridgeError}`);
  }

  if (!body?.success) {
    const bridgeError = asNonEmptyString(body?.error) ?? 'unknown_error';
    throw new Error(`Neup account bridge request failed: ${bridgeError}`);
  }

  return parseNeupConnectionAccountInfo(body);
}

/*
::neup.documentation::logica-account-get-current-account-id-function
::function getCurrentAccountId(authAccountToken)

Returns the current connected account id.

::public

Reads the `accountId` field from the normalized current application account
connection.

::public end

::end
*/
export async function getCurrentAccountId(authAccountToken: string): Promise<string> {
  const info = await getCurrentApplicationAccount(authAccountToken);
  return info.accountId;
}

/*
::neup.documentation::logica-account-get-current-connection-id-function
::function getCurrentConnectionId(authAccountToken)

Returns the current application connection id.

::public

Reads the `connectionId` field from the normalized current application account
connection.

::public end

::end
*/
export async function getCurrentConnectionId(authAccountToken: string): Promise<string> {
  const info = await getCurrentApplicationAccount(authAccountToken);
  return info.connectionId;
}

/*
::neup.documentation::logica-account-get-current-account-display-name-function
::function getCurrentAccountDisplayName(authAccountToken)

Returns the current account display name.

::public

Reads the `displayName` field from the normalized current application account
connection.

::public end

::end
*/
export async function getCurrentAccountDisplayName(authAccountToken: string): Promise<string> {
  const info = await getCurrentApplicationAccount(authAccountToken);
  return info.displayName;
}

/*
::neup.documentation::logica-account-get-current-account-display-image-function
::function getCurrentAccountDisplayImage(authAccountToken)

Returns the current account display image.

::public

Reads the nullable `displayImage` field from the normalized current application
account connection.

::public end

::end
*/
export async function getCurrentAccountDisplayImage(authAccountToken: string): Promise<string | null> {
  const info = await getCurrentApplicationAccount(authAccountToken);
  return info.displayImage;
}
