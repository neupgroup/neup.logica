/*
::neup.documentation::logica-account-get-account-info-module
::title Logica Get Account Info Helper

Portable wrapper for `/bridge/api.v1/accounts/lookup`.

::public

Use this helper to fetch a normalized account profile snapshot that returns only `displayName` and `displayImage`.

::public end

::end
*/

import baseJson from '@/logica/neupid/base.json';
import type { NeupBridgeResponse } from '@/logica/core/api-runner';

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

export async function getAccountInfo(
  input: GetAccountInfoInput,
): Promise<NeupBridgeResponse<GetAccountInfoResponseBody>> {
  const url = new URL('/bridge/api.v1/accounts/lookup', baseJson.baseEndpoint);

  const response = await fetch(url.toString(), {
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
    body: {
      success: Boolean(body?.success),
      displayName: asStringOrNull(body?.profile?.displayName),
      displayImage: asStringOrNull(body?.profile?.displayImage),
      ...(typeof body?.error === 'string' ? { error: body.error } : {}),
    },
    headers: response.headers,
  };
}
