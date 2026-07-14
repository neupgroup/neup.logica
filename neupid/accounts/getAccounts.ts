/*
::neup.documentation::logica-account-get-accounts-module
::title Logica Get Accounts Helper

Portable wrapper for `/bridge/api.v1/accounts`.

::public

Use this helper to fetch the accessible accounts that the authenticated caller may use for application connections.

::public end

::end
*/

import baseJson from '@/logica/neupid/base.json';
import type { NeupBridgeResponse } from '@/logica/core/api-runner';

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

export async function getAccounts(
  input: GetNeupAccountsInput = {},
): Promise<NeupBridgeResponse<GetNeupAccountsResponseBody>> {
  const url = new URL('/bridge/api.v1/accounts', baseJson.baseEndpoint);

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

/*
::neup.documentation::logica-account-get-brand-accounts-function
::title Logica Get Brand Accounts Function

Returns only brand accounts from the accessible account list.

::public

Use this helper when the caller needs only accessible brand accounts.

::public end

::end
*/
export async function getBrandAccounts(
  input: GetNeupAccountsInput = {},
): Promise<NeupBridgeResponse<GetNeupAccountsResponseBody>> {
  const response = await getAccounts(input);
  return filterAccountsByType(response, 'brand');
}

/*
::neup.documentation::logica-account-get-individual-accounts-function
::title Logica Get Individual Accounts Function

Returns only individual accounts from the accessible account list.

::public

Use this helper when the caller needs only accessible individual accounts.

::public end

::end
*/
export async function getIndividualAccounts(
  input: GetNeupAccountsInput = {},
): Promise<NeupBridgeResponse<GetNeupAccountsResponseBody>> {
  const response = await getAccounts(input);
  return filterAccountsByType(response, 'individual');
}

/*
::neup.documentation::logica-account-get-dependent-accounts-function
::title Logica Get Dependent Accounts Function

Returns only dependent accounts from the accessible account list.

::public

Use this helper when the caller needs only accessible dependent accounts.

::public end

::end
*/
export async function getDependentAccounts(
  input: GetNeupAccountsInput = {},
): Promise<NeupBridgeResponse<GetNeupAccountsResponseBody>> {
  const response = await getAccounts(input);
  return filterAccountsByType(response, 'dependent');
}

/*
::neup.documentation::logica-account-get-subbrand-accounts-function
::title Logica Get SubBrand Accounts Function

Returns only subbrand accounts from the accessible account list.

::public

Use this helper when the caller needs only accessible subbrand accounts.

::public end

::end
*/
export async function getSubBrandAccounts(
  input: GetNeupAccountsInput = {},
): Promise<NeupBridgeResponse<GetNeupAccountsResponseBody>> {
  const response = await getAccounts(input);
  return filterAccountsByType(response, 'subbrand');
}
