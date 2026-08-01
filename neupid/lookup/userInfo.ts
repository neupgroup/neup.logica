/*
::neup.documentation::logica-neupid-lookup-user-info-module
::title Logica NeupID User Info Lookup

Portable wrapper for checking a connected user's account information.

::public

Use `getUserInfo` to fetch basic user information from `/bridge/api.v1/accounts/lookup`.
When `fields` is omitted, the bridge returns the default basic fields. When `fields`
is provided, the response is limited to the requested user-info fields. The helper
supports app-secret lookup by `accountId` or `connectionId`, and auth-cookie lookup
for the signed-in account.

`NEUP_APP_ID` and `NEUP_APP_SECRET` must be present in `process.env`; the helper
throws when either value is missing.

Input modes:

- `{ accountId }`
- `{ connectionId }`
- `{ authAccountToken }`

Default fields are `displayName`, `displayImage`, `connectionId`, `accountId`,
and `accountType`.

Supported fields are `neupid`, `displayName`, `accountId`, `displayImage`,
`lastActive`, `isMinor`, `connectionId`, `accountType`, `appId`, `gender`,
`birthDate`, and `createdAt`.

For party `2` and `3` app-secret lookups, the bridge requires an active app
connection and may return only `connectionId`, `appId`, `displayName`,
`displayImage`, `gender`, `isMinor`, `birthDate`, and `createdAt`.

::public end

::private

The auth-cookie mode forwards `authAccountToken` as an `auth_account` cookie
header because the bridge rejects account authentication supplied through custom
headers or query parameters.

::private end

::end
*/

import baseJson from '@/logica/neupid/base.json';
import { makeUrl } from '@/core/helpers/url';
import { getNeupBridgeEnvironment, type NeupBridgeResponse } from '@/logica/neupid/api';

export const neupUserInfoBasicFields = [
  'displayName',
  'displayImage',
  'connectionId',
  'accountId',
  'accountType',
] as const;

export const neupUserInfoFields = [
  'neupid',
  'displayName',
  'accountId',
  'displayImage',
  'lastActive',
  'isMinor',
  'connectionId',
  'accountType',
  'appId',
  'gender',
  'birthDate',
  'createdAt',
] as const;

export type NeupUserInfoField = (typeof neupUserInfoFields)[number];

export type NeupUserInfoPayload = {
  neupid: string | null;
  displayName: string | null;
  accountId: string | null;
  displayImage: string | null;
  lastActive: string | null;
  isMinor: boolean | null;
  connectionId: string | null;
  accountType: string | null;
  appId: string | null;
  gender: string | null;
  birthDate: string | null;
  createdAt: string | null;
};

type GetUserInfoBaseInput = {
  fields?: readonly NeupUserInfoField[] | null;
};

export type GetUserInfoInput =
  | (GetUserInfoBaseInput & {
      accountId: string;
      connectionId?: never;
      authAccountToken?: never;
    })
  | (GetUserInfoBaseInput & {
      connectionId: string;
      accountId?: never;
      authAccountToken?: never;
    })
  | (GetUserInfoBaseInput & {
      authAccountToken: string;
      appSecret?: never;
      accountId?: never;
      connectionId?: never;
    });

export type GetUserInfoResponseBody = {
  success: boolean;
  error?: string;
  reason?: string;
} & Partial<NeupUserInfoPayload>;

type AccountLookupResponseBody = {
  success?: boolean;
  profile?: Record<string, unknown>;
  error?: string;
  reason?: string;
};

const userInfoFieldSet = new Set<string>(neupUserInfoFields);

function asStringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function asBooleanOrNull(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function normalizeFields(fields?: readonly NeupUserInfoField[] | null): NeupUserInfoField[] | undefined {
  if (!fields?.length) return undefined;
  return Array.from(new Set(fields)).filter((field) => userInfoFieldSet.has(field));
}

function normalizeProfile(profile: Record<string, unknown> | undefined): Partial<NeupUserInfoPayload> {
  if (!profile) return {};

  const output: Partial<NeupUserInfoPayload> = {};

  if (Object.hasOwn(profile, 'neupid')) output.neupid = asStringOrNull(profile.neupid);
  if (Object.hasOwn(profile, 'displayName')) output.displayName = asStringOrNull(profile.displayName);
  if (Object.hasOwn(profile, 'accountId')) output.accountId = asStringOrNull(profile.accountId);
  if (Object.hasOwn(profile, 'displayImage')) output.displayImage = asStringOrNull(profile.displayImage);
  if (Object.hasOwn(profile, 'lastActive')) output.lastActive = asStringOrNull(profile.lastActive);
  if (Object.hasOwn(profile, 'isMinor')) output.isMinor = asBooleanOrNull(profile.isMinor);
  if (Object.hasOwn(profile, 'connectionId')) output.connectionId = asStringOrNull(profile.connectionId);
  if (Object.hasOwn(profile, 'accountType')) output.accountType = asStringOrNull(profile.accountType);
  if (Object.hasOwn(profile, 'appId')) output.appId = asStringOrNull(profile.appId);
  if (Object.hasOwn(profile, 'gender')) output.gender = asStringOrNull(profile.gender);
  if (Object.hasOwn(profile, 'birthDate')) output.birthDate = asStringOrNull(profile.birthDate);
  if (Object.hasOwn(profile, 'createdAt')) output.createdAt = asStringOrNull(profile.createdAt);

  return output;
}

export async function getUserInfo(
  input: GetUserInfoInput,
): Promise<NeupBridgeResponse<GetUserInfoResponseBody>> {
  const fields = normalizeFields(input.fields);
  const env = getNeupBridgeEnvironment();
  const url = makeUrl(baseJson.baseEndpointBridge, '/bridge/api.v1/accounts/lookup');
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  // The bridge accepts auth_account only as a cookie, not as a custom auth header.
  if ('authAccountToken' in input && typeof input.authAccountToken === 'string') {
    const authAccountToken = input.authAccountToken.trim();
    if (authAccountToken) {
      headers.cookie = `auth_account=${authAccountToken}`;
    }
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      appId: env.appId,
      // App credentials are owned by env so callers cannot accidentally send the wrong application identity.
      ...(!('authAccountToken' in input) ? { appSecret: env.appSecret } : {}),
      // Only one lookup target is emitted because GetUserInfoInput is a discriminated union by shape.
      ...('accountId' in input ? { accountId: input.accountId } : {}),
      ...('connectionId' in input ? { connectionId: input.connectionId } : {}),
      ...(fields ? { fields } : {}),
    }),
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as AccountLookupResponseBody | null;

  return {
    ok: response.ok,
    status: response.status,
    body: {
      success: Boolean(body?.success),
      ...normalizeProfile(body?.profile),
      ...(typeof body?.error === 'string' ? { error: body.error } : {}),
      ...(typeof body?.reason === 'string' ? { reason: body.reason } : {}),
    },
    headers: response.headers,
  };
}
