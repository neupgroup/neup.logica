/*
::neup.documentation::logica-account-self-module
::title Logica Account Self Helpers

Current caller account helpers exposed through `logica.account.self`.

::public

Use `logica.account.self.isAuthenticated()` to check the current account session
locally or remotely. Use `logica.account.self.getBasics()` to read basic current
account profile information.

::public end

::end
*/

import {
  checkAuthSession,
  type CheckNeupAuthenticationResult,
} from '#/logica/account/auth';
import {
  decodeNeupIdToken,
  verifyNeupIdToken,
  type NeupIdTokenPayload,
} from '#/logica/account/token/verify';
import {
  getAccountBasics,
  type LookupResponseBody,
} from '#/logica/account/lookup';

export type AccountSelfAuthenticationCheckType = 'local' | 'remote';

export type AccountSelfBasics = {
  displayName: string | null;
  displayImage: string | null;
  neupid: string | null;
};

export type AccountSelfRecord = {
  id: string;
  displayName: string;
  displayImage: string;
  neupId: string | null;
  type: string;
  createdOn: string;
  status: string;
  moreDetails: unknown;
};

type AccountSelfLocalAuthenticationResult =
  | { authenticated: true; payload: NeupIdTokenPayload }
  | { authenticated: false; reason: string; payload?: Partial<NeupIdTokenPayload> };

export type AccountSelfAuthenticationResult =
  | CheckNeupAuthenticationResult
  | AccountSelfLocalAuthenticationResult;

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

async function getServerAuthAccountToken(): Promise<string | null> {
  if (typeof window !== 'undefined') return null;

  try {
    const { getCookie } = await import('#/core/helpers/cookie');
    return (await getCookie('auth_account'))?.trim() || null;
  } catch {
    return null;
  }
}

async function resolveAuthAccountToken(authToken?: string | null): Promise<string | null> {
  return authToken?.trim() || getBrowserAuthAccountToken() || await getServerAuthAccountToken();
}

function hasDatabaseEnvironment(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim() && process.env.DATABASE_PROVIDER?.trim());
}

function hasRemoteAccountEnvironment(): boolean {
  const appId = process.env.NEUP_APP_ID?.trim() || process.env.neup_app_id?.trim();
  const appSecret = process.env.NEUP_APP_SECRET?.trim() || process.env.neup_app_secret?.trim();

  return Boolean(appId && appSecret);
}

function normalizeBasics(input: {
  displayName?: string | null;
  displayImage?: string | null;
  neupid?: string | null;
}): AccountSelfBasics | null {
  const displayName = input.displayName?.trim() || null;
  const displayImage = input.displayImage?.trim() || null;
  const neupid = input.neupid?.trim() || null;

  if (!displayName && !displayImage && !neupid) return null;

  return {
    displayName,
    displayImage,
    neupid,
  };
}

function getAccountIdFromToken(authToken: string | null): string | null {
  const payload = decodeNeupIdToken(authToken);
  return typeof payload?.aid === 'string' ? payload.aid.trim() || null : null;
}

async function getLocalAccountBasics(authToken: string | null): Promise<AccountSelfBasics[]> {
  if (!hasDatabaseEnvironment()) return [];

  const accountId = getAccountIdFromToken(authToken);
  if (!accountId) return [];

  try {
    const { default: prisma } = await import('#/core/database/prisma');
    const accountDelegate = (prisma as unknown as {
      account?: {
        findUnique: (args: {
          where: { id: string };
          select: {
            displayName: true;
            displayImage: true;
            neupid: true;
          };
        }) => Promise<AccountSelfBasics | null>;
      };
    }).account;

    if (!accountDelegate) return [];

    const account = await accountDelegate.findUnique({
      where: { id: accountId },
      select: {
        displayName: true,
        displayImage: true,
        neupid: true,
      },
    });
    const basics = normalizeBasics(account ?? {});

    return basics ? [basics] : [];
  } catch {
    return [];
  }
}

async function ensureLocalAccountRecord(authToken: string | null): Promise<AccountSelfRecord | null> {
  if (!hasDatabaseEnvironment()) return null;

  const accountId = getAccountIdFromToken(authToken);
  if (!accountId) return null;

  const authentication = await checkLocalAuthentication(authToken);
  if (!authentication.authenticated) return null;

  const basics = (await getBasics(authToken))[0] ?? null;

  try {
    const { default: prisma } = await import('#/core/database/prisma');
    const accountDelegate = (prisma as unknown as {
      account?: {
        upsert: (args: {
          where: { id: string };
          create: {
            id: string;
            displayName: string;
            displayImage: string;
            neupId: string | null;
            type: string;
            status: string;
          };
          update: {
            displayName: string;
            displayImage: string;
            neupId: string | null;
          };
          select: {
            id: true;
            displayName: true;
            displayImage: true;
            neupId: true;
            type: true;
            createdOn: true;
            status: true;
            moreDetails: true;
          };
        }) => Promise<{
          id: string;
          displayName: string;
          displayImage: string;
          neupId: string | null;
          type: string;
          createdOn: Date;
          status: string;
          moreDetails: unknown;
        }>;
      };
    }).account;

    if (!accountDelegate) return null;

    const record = await accountDelegate.upsert({
      where: { id: accountId },
      create: {
        id: accountId,
        displayName: basics?.displayName ?? '',
        displayImage: basics?.displayImage ?? '',
        neupId: basics?.neupid ?? null,
        type: 'individual',
        status: 'active',
      },
      update: {
        displayName: basics?.displayName ?? '',
        displayImage: basics?.displayImage ?? '',
        neupId: basics?.neupid ?? null,
      },
      select: {
        id: true,
        displayName: true,
        displayImage: true,
        neupId: true,
        type: true,
        createdOn: true,
        status: true,
        moreDetails: true,
      },
    });

    return {
      id: record.id,
      displayName: record.displayName,
      displayImage: record.displayImage,
      neupId: record.neupId,
      type: record.type,
      createdOn: record.createdOn.toISOString(),
      status: record.status,
      moreDetails: record.moreDetails,
    };
  } catch {
    return null;
  }
}

function getRemoteBasicsFromBody(body: LookupResponseBody): AccountSelfBasics[] {
  if (!body.success) return [];

  const basics = normalizeBasics({
    displayName: body.displayName ?? null,
    displayImage: body.displayImage ?? null,
    neupid: body.neupid ?? null,
  });

  return basics ? [basics] : [];
}

async function getRemoteAccountBasics(authToken: string | null): Promise<AccountSelfBasics[]> {
  if (!hasRemoteAccountEnvironment() || !authToken) return [];

  try {
    const response = await getAccountBasics({
      authAccountToken: authToken,
      fields: ['displayName', 'displayImage', 'neupid'],
    });

    if (!response.ok) return [];

    return getRemoteBasicsFromBody(response.body);
  } catch {
    return [];
  }
}

async function checkLocalAuthentication(
  authToken?: string | null,
): Promise<AccountSelfAuthenticationResult> {
  const token = await resolveAuthAccountToken(authToken);
  const result = await verifyNeupIdToken(token);

  if (result.valid) {
    return {
      authenticated: true,
      payload: result.payload,
    };
  }

  return {
    authenticated: false,
    reason: result.reason,
    payload: result.payload,
  };
}

/*
::neup.documentation::logica-account-self-is-authenticated-function
::function isAuthenticated(checkType, authToken)

Checks whether the current account is authenticated.

::public

When `checkType` is omitted or `local`, the function verifies the auth token
locally. When `checkType` is `remote`, it checks the account bridge and forwards
the provided token, or reads the `auth_account` cookie when no token is passed.

::public end

::param external checkType
::datatype "local" | "remote"
::required false

Selects local token verification or remote bridge validation.

::param external authToken
::datatype string
::required false

Explicit auth token. When omitted, the `auth_account` cookie is used when
available.

::end
*/
export async function isAuthenticated(
  checkType?: AccountSelfAuthenticationCheckType,
  authToken?: string | null,
): Promise<AccountSelfAuthenticationResult> {
  if (checkType === 'remote') {
    return checkAuthSession({
      authAccountToken: await resolveAuthAccountToken(authToken),
    });
  }

  return checkLocalAuthentication(authToken);
}

/*
::neup.documentation::logica-account-self-get-basics-function
::function getBasics(authToken)

Returns basic information for the current account.

::public

The function first attempts to read the local `accounts` table when
`DATABASE_URL` and `DATABASE_PROVIDER` are configured. If local lookup is not
available or does not find the current account, it falls back to the account
bridge when `NEUP_APP_ID` and `NEUP_APP_SECRET` are configured. Missing remote
credentials return an empty array.

::public end

::param external authToken
::datatype string
::required false

Explicit auth token. When omitted, the `auth_account` cookie is used when
available.

::end
*/
export async function getBasics(authToken?: string | null): Promise<AccountSelfBasics[]> {
  const authAccountToken = await resolveAuthAccountToken(authToken);
  const localBasics = await getLocalAccountBasics(authAccountToken);

  if (localBasics.length > 0) {
    return localBasics;
  }

  return getRemoteAccountBasics(authAccountToken);
}

export async function ensureRecord(authToken?: string | null): Promise<AccountSelfRecord | null> {
  const resolvedAuthToken = await resolveAuthAccountToken(authToken);
  return ensureLocalAccountRecord(resolvedAuthToken);
}

/*
::neup.documentation::logica-account-self-object
::function self

Current caller account child object.

::public

Use `logica.account.self.*` for operations scoped to the caller's own account
session.

::public end

::end
*/
export const self = {
  isAuthenticated,
  getBasics,
  ensureRecord,
} as const;
