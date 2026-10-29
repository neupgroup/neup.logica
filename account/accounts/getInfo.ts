/*
::neup.documentation::logica-account-get-account-info-module
::title Logica Get Account Info Helper

Portable wrapper for `/bridge/api.v1/accounts/lookup`.

::public

Use this helper to fetch a normalized account profile snapshot that returns only `displayName` and `displayImage`.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';




const Basepath = 'bridge/api.v1';
const AccountsLookupEndpoint = `${Basepath}/accounts/lookup`;

type GetAccountInfoInput = {
  appId: string;
  appSecret: string;
  accountId: string;
};

type GetAccountInfoResponseBody = {
  success: boolean;
  displayName: string | null;
  displayImage: string | null;
  error?: string;
};

type AccountLookupResponseBody = {
  success?: boolean;
  profile?: {
    displayName?: unknown;
    displayImage?: unknown;
  };
  error?: string;
};

function asStringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

/*
::neup.documentation::logica-account-get-account-info-function
::function getAccountInfo(input)

Fetches normalized account display information.

::public

Calls `/bridge/api.v1/accounts/lookup` with application credentials and returns
display name and display image values.

::public end

::end
*/
export async function getAccountInfo(
  input: GetAccountInfoInput,
): Promise<ApiResponse<GetAccountInfoResponseBody>> {
  const response = await runApi<AccountLookupResponseBody>({
    baseUrl: getBaseUrl('neupid'),
    path: AccountsLookupEndpoint,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: {
      appId: input.appId,
      appSecret: input.appSecret,
      accountId: input.accountId,
    },
  });

  const body = response.body as AccountLookupResponseBody | null;

  return {
    ok: response.ok,
    status: response.status,
    body: {
      success: Boolean(body?.success),
      displayName: asStringOrNull(body?.profile?.displayName),
      displayImage: asStringOrNull(body?.profile?.displayImage),
      ...(typeof body?.error === 'string' ? { error: body.error } : {}),
    },
    headers: response.headers,
  };
}
