/*
::neup.documentation::logica-account-current-file
::title Logica Account Current File

Current authenticated account object.

::public

This file backs `logica.account.current` and its current account, connection,
display, permission, and application child objects.

::public end

::end
*/

import {
  connectCurrentAccount,
  getCurrentAccountDisplayImage,
  getCurrentAccountDisplayName,
  getCurrentAccountId,
  getCurrentApplicationAccount,
} from '#/logica/account/connection';
import {
  getCurrentAccount,
  getCurrentAccountPermissions,
} from '#/logica/account/profile';

type CurrentTokenInput = string;

function createCurrentPermissionScope(permissionName: string) {
  return {
    async check(authAccountToken: CurrentTokenInput): Promise<boolean> {
      const response = await getCurrentAccountPermissions(authAccountToken);
      const permissions = response.body && typeof response.body === 'object'
        ? (response.body as { permissions?: unknown }).permissions
        : null;

      if (!Array.isArray(permissions)) return false;

      return permissions.some((permission) =>
        typeof permission === 'string'
          && permission.trim().toLowerCase() === permissionName.trim().toLowerCase()
      );
    },
  } as const;
}

const permission = function permission(permissionName: string) {
  return createCurrentPermissionScope(permissionName);
};

permission.list = function list(authAccountToken: CurrentTokenInput) {
  return getCurrentAccountPermissions(authAccountToken);
};

/*
::neup.documentation::logica-account-current-object
::function current

Current authenticated account child object.

::public

Use `logica.account.current.*` when operations are scoped by an auth-account
token instead of a specific account id argument.

::public end

::end
*/
export const current = {
  get(authAccountToken: CurrentTokenInput) {
    return getCurrentAccount(authAccountToken);
  },

  id: {
    get(authAccountToken: CurrentTokenInput) {
      return getCurrentAccountId(authAccountToken);
    },
  },

  connection: {
    get(authAccountToken: CurrentTokenInput) {
      return getCurrentApplicationAccount(authAccountToken);
    },
  },

  displayName: {
    get(authAccountToken: CurrentTokenInput) {
      return getCurrentAccountDisplayName(authAccountToken);
    },
  },

  displayImage: {
    get(authAccountToken: CurrentTokenInput) {
      return getCurrentAccountDisplayImage(authAccountToken);
    },
  },

  profile: {
    get(authAccountToken: CurrentTokenInput) {
      return getCurrentAccount(authAccountToken);
    },
  },

  permission,

  application: {
    connect(authAccountToken: CurrentTokenInput) {
      return connectCurrentAccount(authAccountToken);
    },

    get(authAccountToken: CurrentTokenInput) {
      return getCurrentApplicationAccount(authAccountToken);
    },

    connection: {
      get(authAccountToken: CurrentTokenInput) {
        return getCurrentApplicationAccount(authAccountToken);
      },
    },
  },
} as const;
