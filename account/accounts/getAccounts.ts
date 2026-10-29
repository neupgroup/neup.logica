/*
::neup.documentation::logica-account-get-accounts-module
::title Logica Get Accounts Helper

Portable wrapper for `/bridge/api.v1/accounts`.

::public

Use this helper to fetch the accessible accounts that the authenticated caller may use for application connections.

::public end

::end
*/


import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';


const Basepath = 'bridge/api.v1';
const AccountsEndpoint = `${Basepath}/accounts`;

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
  response: ApiResponse<GetNeupAccountsResponseBody>,
  accountType: string,
): ApiResponse<GetNeupAccountsResponseBody> {
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
::neup.documentation::logica-account-get-accounts-function
::function getAccounts(input)

Lists accounts available to the caller.

::public

Uses auth-account or bearer credentials to fetch accounts that may be used for
application connection flows.

::public end

::end
*/
export async function getAccounts(
  input: GetNeupAccountsInput = {},
): Promise<ApiResponse<GetNeupAccountsResponseBody>> {
  const headers = new Headers();

  if (input.bearerToken?.trim()) {
    headers.set('authorization', `Bearer ${input.bearerToken.trim()}`);
  }

  const response = await runApi<GetNeupAccountsResponseBody>({
    baseUrl: getBaseUrl('neupid'),
    path: AccountsEndpoint,
    method: 'GET',
    query: {
      appSecret: input.bearerToken?.trim() && input.appSecret?.trim() ? input.appSecret.trim() : undefined,
    },
    headers,
    cookies: input.authAccountToken?.trim() ? { auth_account: input.authAccountToken.trim() } : undefined,
  });

  return {
    ok: response.ok,
    status: response.status,
    body: response.body,
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
): Promise<ApiResponse<GetNeupAccountsResponseBody>> {
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
): Promise<ApiResponse<GetNeupAccountsResponseBody>> {
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
): Promise<ApiResponse<GetNeupAccountsResponseBody>> {
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
): Promise<ApiResponse<GetNeupAccountsResponseBody>> {
  const response = await getAccounts(input);
  return filterAccountsByType(response, 'subbrand');
}
