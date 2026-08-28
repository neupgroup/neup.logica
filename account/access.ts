/*
::neup.documentation::logica-account-access-module
::title Logica Access Route Helpers

Portable wrappers for bridge access and application-team routes.

::public

Use this module for `/bridge/api.v1/access/connection` and `/bridge/api.v1/access/team`.

::public end

::end
*/

import { runNeupBridgeApi, type NeupBridgeResponse } from '#/logica/account/api';
import {
  getAccessibleAccounts,
  getAccessibleBrandAccounts,
  getAccessibleDependentAccounts,
  getAccessibleSubBrandAccounts,
  getAccountAccess,
} from '#/logica/account/connections/getInfo';
import { hasAccountPermission, type HasPermissionOptions } from '#/logica/account/connections/permissions';

type AccessAuth = {
  authAccountToken?: string | null;
  authTokenHeader?: string | null;
};

function buildAccessHeaders(input: AccessAuth): HeadersInit | undefined {
  if (!input.authTokenHeader?.trim()) return undefined;
  return { auth: input.authTokenHeader.trim() };
}

/*
::neup.documentation::logica-account-get-connection-team-members-function
::function getConnectionTeamMembers(input)

Lists team members for one connection.

::public

Calls the connection access bridge route with a connection id and optional
profile filter.

::public end

::end
*/
export async function getConnectionTeamMembers(input: AccessAuth & {
  connection: string;
  profile?: string;
}): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/access/connection',
    method: 'GET',
    query: {
      connection: input.connection,
      profile: input.profile,
    },
    authAccountToken: input.authAccountToken,
    headers: buildAccessHeaders(input),
  });
}

/*
::neup.documentation::logica-account-get-connection-team-member-access-function
::function getConnectionTeamMemberAccess(input)

Fetches access details for one connection team member.

::public

Calls the connection access bridge route with POST semantics for one connection
and optional member profile.

::public end

::end
*/
export async function getConnectionTeamMemberAccess(input: AccessAuth & {
  connection: string;
  profile?: string;
}): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/access/connection',
    method: 'POST',
    body: {
      connection: input.connection,
      profile: input.profile,
    },
    authAccountToken: input.authAccountToken,
    headers: buildAccessHeaders(input),
  });
}

/*
::neup.documentation::logica-account-get-application-team-members-function
::function getApplicationTeamMembers(input)

Lists team members for one application.

::public

Calls the application team access bridge route with an application id and
optional profile filter.

::public end

::end
*/
export async function getApplicationTeamMembers(input: AccessAuth & {
  app: string;
  profile?: string;
}): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/access/team',
    method: 'GET',
    query: {
      app: input.app,
      profile: input.profile,
    },
    authAccountToken: input.authAccountToken,
    headers: buildAccessHeaders(input),
  });
}

/*
::neup.documentation::logica-account-get-application-team-member-access-function
::function getApplicationTeamMemberAccess(input)

Fetches access details for one application team member.

::public

Calls the application team access bridge route with POST semantics for one
application and optional profile.

::public end

::end
*/
export async function getApplicationTeamMemberAccess(input: AccessAuth & {
  app: string;
  profile?: string;
}): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/access/team',
    method: 'POST',
    body: {
      app: input.app,
      profile: input.profile,
    },
    authAccountToken: input.authAccountToken,
    headers: buildAccessHeaders(input),
  });
}

type AccessibleListInput = Parameters<typeof getAccessibleAccounts>[0];

function filterAccessibleAccountsByType<TResponse extends NeupBridgeResponse<{ accounts?: { accountType: string }[] }>>(
  response: TResponse,
  accountType: string,
): TResponse {
  return {
    ...response,
    body: {
      ...response.body,
      accounts: response.body.accounts?.filter(
        (accountRecord) => accountRecord.accountType.trim().toLowerCase() === accountType,
      ),
    },
    headers: response.headers,
  };
}

/*
::neup.documentation::logica-account-create-accessible-type-scope-function
::function createAccessibleTypeScope(accountType)

Creates an accessible account type filter object.

::public

Backs `logica.account.accessible.type(accountType).list()` and fixed type
children such as `logica.account.accessible.brand.list()`.

::public end

::end
*/
export function createAccessibleTypeScope(accountType: 'brand' | 'individual' | 'dependent' | 'subbrand') {
  return {
    list(input: AccessibleListInput = {}) {
      if (accountType === 'brand') return getAccessibleBrandAccounts(input);
      if (accountType === 'dependent') return getAccessibleDependentAccounts(input);
      if (accountType === 'subbrand') return getAccessibleSubBrandAccounts(input);

      return getAccessibleAccounts(input).then((response) =>
        filterAccessibleAccountsByType(response, 'individual')
      );
    },
  } as const;
}

/*
::neup.documentation::logica-account-accessible-object
::function accessible

Accessible account collection child object.

::public

Backs `logica.account.accessible` for listing accounts the authenticated caller
can access, optionally filtered by account type.

::public end

::end
*/
export const accessible = {
  list(input: AccessibleListInput = {}) {
    return getAccessibleAccounts(input);
  },

  type: createAccessibleTypeScope,
  brand: createAccessibleTypeScope('brand'),
  individual: createAccessibleTypeScope('individual'),
  dependent: createAccessibleTypeScope('dependent'),
  subbrand: createAccessibleTypeScope('subbrand'),
} as const;

function createAccountPermissionScope(accountId: string, permissionName: string) {
  return {
    check(forApplicationID: string, byAccount = accountId, options: HasPermissionOptions = {}) {
      return hasAccountPermission(permissionName, forApplicationID, accountId, byAccount, options);
    },
  } as const;
}

/*
::neup.documentation::logica-account-create-account-access-function
::function createAccountAccess(accountId)

Creates the access child object for one account.

::public

Backs `logica.account(accountId).access` and the account permission child object.

::public end

::end
*/
export function createAccountAccess(accountId: string) {
  const permission = function permission(permissionName: string) {
    return createAccountPermissionScope(accountId, permissionName);
  };

  permission.list = function list(input: Omit<Parameters<typeof getAccountAccess>[0], 'accountId'>) {
    return getAccountAccess({ ...input, accountId });
  };

  return {
    permission,
  } as const;
}

/*
::neup.documentation::logica-account-access-scope-type
::type AccountAccessScope

Return type for `createAccountAccess`.

::public

Represents the shape of `logica.account(accountId).access`.

::public end

::end
*/
export type AccountAccessScope = ReturnType<typeof createAccountAccess>;
