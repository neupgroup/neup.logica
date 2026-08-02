/*
::neup.documentation::logica-account-connections-get-info-module
::title Logica Connections Get Info Helper

Portable wrappers for `/bridge/api.v1/accounts/lookup` and account filtering helpers.

::public

Use this module to fetch connection-access info, normalized profile fields, and manageable-account subsets.

::public end

::end
*/

import { createNeupBridgeUrl, type NeupBridgeResponse } from '@/logica/account/api';

type NeupAccessibleAccount = {
  id: string;
  displayName: string | null;
  displayImage: string | null;
  status: string | null;
  isVerified: boolean;
  accountType: string;
  lastActivityAt: string | null;
  neupId: string | null;
  permissions: string[];
};

type GetNeupAccountsResponseBody = {
  success: boolean;
  accounts?: NeupAccessibleAccount[];
  error?: string;
};

type GetNeupAccountsInput = {
  authAccountToken?: string | null;
  bearerToken?: string | null;
  appSecret?: string | null;
};

type GetLookupInput = {
  appId: string;
  appSecret: string;
  accountId: string;
};

type AccountLookupResponseBody = {
  success?: boolean;
  profile?: {
    neupid?: unknown;
    accountId?: unknown;
    displayName?: unknown;
    displayImage?: unknown;
  };
  access?: unknown;
  error?: string;
};

type GetAccessResponseBody = {
  success: boolean;
  access: unknown[];
  error?: string;
};

type GetProfileResponseBody = {
  success: boolean;
  neupid: string | null;
  accountId: string | null;
  displayName: string | null;
  displayImage: string | null;
  error?: string;
};

function asStringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

async function getLookup(
  input: GetLookupInput,
): Promise<NeupBridgeResponse<AccountLookupResponseBody>> {
  const url = createNeupBridgeUrl('/bridge/api.v1/accounts/lookup');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      appId: input.appId,
      appSecret: input.appSecret,
      accountId: input.accountId,
    }),
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as AccountLookupResponseBody | null;

  return {
    ok: response.ok,
    status: response.status,
    body: body ?? {},
    headers: response.headers,
  };
}

async function getAccounts(
  input: GetNeupAccountsInput = {},
): Promise<NeupBridgeResponse<GetNeupAccountsResponseBody>> {
  const url = new URL(createNeupBridgeUrl('/bridge/api.v1/accounts'));

  if (input.bearerToken?.trim() && input.appSecret?.trim()) {
    url.searchParams.set('appSecret', input.appSecret.trim());
  }

  const headers = new Headers();

  if (input.bearerToken?.trim()) {
    headers.set('authorization', `Bearer ${input.bearerToken.trim()}`);
  }

  if (input.authAccountToken?.trim()) {
    headers.set('cookie', `auth_account=${input.authAccountToken.trim()}`);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as GetNeupAccountsResponseBody;

  return {
    ok: response.ok,
    status: response.status,
    body,
    headers: response.headers,
  };
}

function filterAccountsByType(
  response: NeupBridgeResponse<GetNeupAccountsResponseBody>,
  accountType: string,
): NeupBridgeResponse<GetNeupAccountsResponseBody> {
  return {
    ...response,
    body: {
      ...response.body,
      accounts: response.body.accounts?.filter(
        (account) => account.accountType.trim().toLowerCase() === accountType,
      ),
    },
    headers: response.headers,
  };
}

/*
::neup.documentation::logica-account-get-account-access-function
::function getAccountAccess(input)

Fetches access rows for one account lookup.

::public

Calls account lookup and returns the normalized access array from the bridge
payload.

::public end

::end
*/
export async function getAccountAccess(
  input: GetLookupInput,
): Promise<NeupBridgeResponse<GetAccessResponseBody>> {
  const response = await getLookup(input);

  return {
    ok: response.ok,
    status: response.status,
    body: {
      success: Boolean(response.body.success),
      access: asArray(response.body.access),
      ...(typeof response.body.error === 'string' ? { error: response.body.error } : {}),
    },
    headers: response.headers,
  };
}

/*
::neup.documentation::logica-account-get-account-basics-by-id-function
::function getAccountBasicsById(input)

Fetches basic profile fields for one account id.

::public

Calls account lookup and returns normalized NeupID, account id, display name,
and display image fields.

::public end

::end
*/
export async function getAccountBasicsById(
  input: GetLookupInput,
): Promise<NeupBridgeResponse<GetProfileResponseBody>> {
  const response = await getLookup(input);

  return {
    ok: response.ok,
    status: response.status,
    body: {
      success: Boolean(response.body.success),
      neupid: asStringOrNull(response.body.profile?.neupid),
      accountId: asStringOrNull(response.body.profile?.accountId),
      displayName: asStringOrNull(response.body.profile?.displayName),
      displayImage: asStringOrNull(response.body.profile?.displayImage),
      ...(typeof response.body.error === 'string' ? { error: response.body.error } : {}),
    },
    headers: response.headers,
  };
}

/*
::neup.documentation::logica-account-get-accessible-brand-accounts-function
::function getAccessibleBrandAccounts(input)

Lists accessible brand accounts.

::public

Filters accessible accounts to brand account records.

::public end

::end
*/
export async function getAccessibleBrandAccounts(
  input: GetNeupAccountsInput = {},
): Promise<NeupBridgeResponse<GetNeupAccountsResponseBody>> {
  const response = await getAccounts(input);
  return filterAccountsByType(response, 'brand');
}

/*
::neup.documentation::logica-account-get-accessible-accounts-function
::function getAccessibleAccounts(input)

Lists accounts accessible to the caller.

::public

Returns the accessible account collection used by `logica.account.accessible`.

::public end

::end
*/
export async function getAccessibleAccounts(
  input: GetNeupAccountsInput = {},
): Promise<NeupBridgeResponse<GetNeupAccountsResponseBody>> {
  return getAccounts(input);
}

/*
::neup.documentation::logica-account-get-accessible-dependent-accounts-function
::function getAccessibleDependentAccounts(input)

Lists accessible dependent accounts.

::public

Filters accessible accounts to dependent account records.

::public end

::end
*/
export async function getAccessibleDependentAccounts(
  input: GetNeupAccountsInput = {},
): Promise<NeupBridgeResponse<GetNeupAccountsResponseBody>> {
  const response = await getAccounts(input);
  return filterAccountsByType(response, 'dependent');
}

/*
::neup.documentation::logica-account-get-accessible-subbrand-accounts-function
::function getAccessibleSubBrandAccounts(input)

Lists accessible subbrand accounts.

::public

Filters accessible accounts to subbrand account records.

::public end

::end
*/
export async function getAccessibleSubBrandAccounts(
  input: GetNeupAccountsInput = {},
): Promise<NeupBridgeResponse<GetNeupAccountsResponseBody>> {
  const response = await getAccounts(input);
  return filterAccountsByType(response, 'subbrand');
}
