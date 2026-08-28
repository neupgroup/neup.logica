/*
::neup.documentation::logica-neupid-lookup-user-info-module
::title Logica NeupID User Info Lookup

Portable wrapper for checking a connected user's account information.

::public

Use `getAccountBasics` to fetch basic user information from `/bridge/api.v1/accounts/lookup`.
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

For personal identification, this helper is intended to work without callers
manually passing identity parameters. When testing from `localhost` against the
`neupgroup.com` account domain, the browser may not send or recognize the
account-domain cookie across domains. In that interdomain setup, auth-cookie
lookup can return no profile value even though the same flow works when the app
and account service run under compatible domains.

::private end

::end
*/

import {
  createNeupBridgeUrl,
  getNeupBridgeEnvironment,
  runNeupBridgeApi,
  type NeupBridgeResponse,
} from '#/logica/account/api';

/*
::neup.documentation::logica-account-neup-user-info-basic-fields-constant
::function neupUserInfoBasicFields

Default account user-info fields.

::public

Lists the fields requested when a caller needs the standard basic profile
payload.

::public end

::end
*/
export const neupUserInfoBasicFields = [
  'displayName',
  'displayImage',
  'connectionId',
  'accountId',
  'accountType',
] as const;

/*
::neup.documentation::logica-account-neup-user-info-fields-constant
::function neupUserInfoFields

Supported account user-info fields.

::public

Lists all fields accepted by account lookup field normalization.

::public end

::end
*/
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

/*
::neup.documentation::logica-account-neup-user-info-field-type
::type NeupUserInfoField

Single supported account user-info field name.

::public

Derived from `neupUserInfoFields` so lookup field selectors stay aligned with
the supported bridge field names.

::public end

::end
*/
export type NeupUserInfoField = (typeof neupUserInfoFields)[number];

/*
::neup.documentation::logica-account-neup-user-info-payload-type
::type NeupUserInfoPayload

Normalized account user-info payload.

::public

Contains nullable account identity, profile, connection, demographic, and
created-at fields returned by account lookup.

::public end

::end
*/
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

type LookupBaseInput = {
  fields?: readonly NeupUserInfoField[] | null;
};

/*
::neup.documentation::logica-account-lookup-input-type
::type LookupInput

Input modes accepted by `getAccountBasics`.

::public

Allows exactly one lookup target: account id, connection id, or auth-account
token.

::public end

::end
*/
export type LookupInput =
  | (LookupBaseInput & {
      accountId: string;
      connectionId?: never;
      authAccountToken?: never;
    })
  | (LookupBaseInput & {
      connectionId: string;
      accountId?: never;
      authAccountToken?: never;
    })
  | (LookupBaseInput & {
      authAccountToken: string;
      appSecret?: never;
      accountId?: never;
      connectionId?: never;
    });

/*
::neup.documentation::logica-account-lookup-response-body-type
::type LookupResponseBody

Normalized body returned by `getAccountBasics`.

::public

Carries success/error state plus the requested subset of account user-info
fields.

::public end

::end
*/
export type LookupResponseBody = {
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

type AccountFields = string | readonly string[] | readonly NeupUserInfoField[] | null;

type ProfileLookupInput = {
  tempToken?: string;
  appId?: string;
  requestedAid?: string;
  aid?: string;
  sid?: string;
  skey?: string;
};

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

function normalizeObjectFields(fields?: AccountFields): NeupUserInfoField[] | undefined {
  if (!fields) return undefined;

  const values = typeof fields === 'string'
    ? fields.split(',')
    : Array.from(fields);

  const normalized = values
    .map((field) => field.trim())
    .filter((field): field is NeupUserInfoField => userInfoFieldSet.has(field));

  return normalized.length ? Array.from(new Set(normalized)) : undefined;
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

/*
::neup.documentation::logica-account-get-account-basics-function
::function getAccountBasics(input)

Fetches normalized account basics.

::public

Looks up account user-info by account id, connection id, or current auth-account
token.

::public end

::end
*/
export async function getAccountBasics(
  input: LookupInput,
): Promise<NeupBridgeResponse<LookupResponseBody>> {
  const fields = normalizeFields(input.fields);
  const env = getNeupBridgeEnvironment();
  const url = createNeupBridgeUrl('/bridge/api.v1/accounts/lookup');
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  // The bridge accepts auth_account only as a cookie, not as a custom auth header.
  // Localhost-to-neupgroup.com testing can fail here because the account cookie is domain-bound.
  if ('authAccountToken' in input && typeof input.authAccountToken === 'string') {
    const authAccountToken = input.authAccountToken.trim();
    if (authAccountToken) {
      headers.cookie = `auth_account=${authAccountToken}`;
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      appId: env.appId,
      // App credentials are owned by env so callers cannot accidentally send the wrong application identity.
      ...(!('authAccountToken' in input) ? { appSecret: env.appSecret } : {}),
      // Only one lookup target is emitted because LookupInput is a discriminated union by shape.
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

/*
::neup.documentation::logica-account-lookup-object
::function lookup

Lookup child object for `logica.account.lookup`.

::public

Provides object traversal for lookup by account id, connection id, NeupID, and
current auth-account token.

::public end

::end
*/
export const lookup = {
  byId(accountId: string) {
    return {
      get(fields?: AccountFields) {
        return getAccountBasics({ accountId, fields: normalizeObjectFields(fields) });
      },
    } as const;
  },

  byConnection(connectionId: string) {
    return {
      get(fields?: AccountFields) {
        return getAccountBasics({ connectionId, fields: normalizeObjectFields(fields) });
      },
    } as const;
  },

  byNeupId(neupId: string) {
    return {
      get(input: ProfileLookupInput = {}) {
        return runNeupBridgeApi({
          path: '/bridge/api.v1/profile',
          method: 'GET',
          query: {
            tempToken: input.tempToken,
            appId: input.appId,
            aid: input.requestedAid,
            neupid: neupId,
          },
          headers: {
            ...(input.aid ? { aid: input.aid } : {}),
            ...(input.sid ? { sid: input.sid } : {}),
            ...(input.skey ? { skey: input.skey } : {}),
          },
        });
      },
    } as const;
  },

  current: {
    get(authAccountToken: string, fields?: AccountFields) {
      return getAccountBasics({ authAccountToken, fields: normalizeObjectFields(fields) });
    },
  },
} as const;
