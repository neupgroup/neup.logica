/*
::neup.documentation::logica-account-profile-module
::title Logica Profile Route Helpers

Portable wrappers for public bridge profile and permission routes.

::public

Use this module for `/bridge/api.v1/profile`, `/bridge/api.v1/profile/public`, `/bridge/api.v1/profile/signed`, and `/bridge/api.v1/permissions`.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import { normalizeAccountFields, type AccountFields } from '@neup/logica/account/fields';
import { getAccountBasics } from '@neup/logica/account/lookup';


const Basepath = 'bridge/api.v1';
const ProfileEndpoint = `${Basepath}/profile`;
const ProfilePublicEndpoint = `${Basepath}/profile/public`;
const ProfileSignedEndpoint = `${Basepath}/profile/signed`;
const PermissionsEndpoint = `${Basepath}/permissions`;

/*
::neup.documentation::logica-account-get-account-profile-function
::function getAccountProfile(input)

Fetches an account profile through the public profile bridge route.

::public

Supports temporary token, application id, requested account id, requested NeupID,
and signed profile headers for bridge profile resolution.

::public end

::end
*/
export async function getAccountProfile(input: {
  tempToken?: string;
  appId?: string;
  requestedAid?: string;
  requestedNeupId?: string;
  aid?: string;
  sid?: string;
  skey?: string;
} = {}): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('neupid'),
    path: ProfileEndpoint,
    method: 'GET',
    query: {
      tempToken: input.tempToken,
      appId: input.appId,
      aid: input.requestedAid,
      neupid: input.requestedNeupId,
    },
    headers: {
      ...(input.aid ? { aid: input.aid } : {}),
      ...(input.sid ? { sid: input.sid } : {}),
      ...(input.skey ? { skey: input.skey } : {}),
    },
  });
}

/*
::neup.documentation::logica-account-get-public-account-profile-function
::function getPublicAccountProfile(input)

Fetches the public profile for one account.

::public

Uses an auth-account token and account id to call the public profile bridge
route.

::public end

::end
*/
export async function getPublicAccountProfile(input: {
  accountId: string;
  authAccountToken: string;
}): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('neupid'),
    path: ProfilePublicEndpoint,
    method: 'GET',
    query: { accountId: input.accountId },
    cookies: { auth_account: input.authAccountToken },
  });
}

/*
::neup.documentation::logica-account-get-current-account-function
::function getCurrentAccount(authAccountToken)

Fetches the signed current account profile.

::public

Uses the auth-account token to call the signed profile bridge route.

::public end

::end
*/
export async function getCurrentAccount(
  authAccountToken: string,
): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('neupid'),
    path: ProfileSignedEndpoint,
    method: 'GET',
    cookies: { auth_account: authAccountToken },
  });
}

/*
::neup.documentation::logica-account-get-current-account-permissions-function
::function getCurrentAccountPermissions(authAccountToken)

Fetches permissions for the current authenticated account.

::public

Returns the bridge response from `/bridge/api.v1/permissions`.

::public end

::end
*/
export async function getCurrentAccountPermissions(
  authAccountToken: string,
): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('neupid'),
    path: PermissionsEndpoint,
    method: 'GET',
    cookies: { auth_account: authAccountToken },
  });
}

/*
::neup.documentation::logica-account-create-account-profile-function
::function createAccountProfile(accountId)

Creates the profile child object for one account.

::public

Backs `logica.account(accountId).profile` with account basics and public profile
lookup operations.

::public end

::end
*/
export function createAccountProfile(accountId: string) {
  return {
    get(fields?: AccountFields) {
      return getAccountBasics({ accountId, fields: normalizeAccountFields(fields) });
    },

    public: {
      get(authAccountToken: string) {
        return getPublicAccountProfile({ accountId, authAccountToken });
      },
    },
  } as const;
}

/*
::neup.documentation::logica-account-profile-scope-type
::type AccountProfileScope

Return type for `createAccountProfile`.

::public

Represents the shape of `logica.account(accountId).profile`.

::public end

::end
*/
export type AccountProfileScope = ReturnType<typeof createAccountProfile>;
