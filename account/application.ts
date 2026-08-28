/*
::neup.documentation::logica-account-application-module
::title Logica Application Route Helpers

Portable wrappers and object scopes for account application bridge routes.

::public

Use `logica.account.application.*` for application account, connection, team,
permission, role, and branding bridge operations.

::public end

::end
*/

import {
  getNeupBridgeEnvironment,
  runNeupBridgeApi,
  type NeupBridgeQuery,
  type NeupBridgeResponse,
} from '#/logica/account/api';
import {
  getApplicationTeamMembers,
  getConnectionTeamMembers,
} from '#/logica/account/access';
import { getApplicationConnections } from '#/logica/account/connections/getConnections';
import { getAccountBasics } from '#/logica/account/lookup';
import { getApplicationLogo } from '#/logica/account/branding';
import { normalizeAccountFields, type AccountFields } from '#/logica/account/fields';

function getApplicationCredentials(input?: { app?: string; appSecret?: string }) {
  const env = getNeupBridgeEnvironment();
  return {
    app: input?.app?.trim() || env.appId,
    appSecret: input?.appSecret?.trim() || env.appSecret,
  };
}

function withApplicationQuery(
  query: NeupBridgeQuery = {},
  input?: { app?: string; appSecret?: string },
): NeupBridgeQuery {
  const credentials = getApplicationCredentials(input);
  return {
    ...query,
    app: credentials.app,
    appSecret: credentials.appSecret,
  };
}

/*
::neup.documentation::logica-account-get-application-account-access-list-function
::function getApplicationAccountAccessList(input)

Lists application account access records.

::public

Calls the application access bridge route using application credentials and
optional pagination/date filters.

::public end

::end
*/
export async function getApplicationAccountAccessList(input: {
  app?: string;
  appSecret?: string;
  start?: string | number;
  end?: string | number;
  startFrom?: string;
  limit?: string | number;
  fromDate?: string;
  toDate?: string;
} = {}): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/application/access',
    method: 'GET',
    query: withApplicationQuery(input, input),
  });
}

/*
::neup.documentation::logica-account-get-application-account-access-function
::function getApplicationAccountAccess(input)

Fetches application access for one account.

::public

Calls the application access bridge route for an account id and optional target
account/filter values.

::public end

::end
*/
export async function getApplicationAccountAccess(input: {
  accountId: string;
  forAccount?: string;
  app?: string;
  appSecret?: string;
  start?: string | number;
  end?: string | number;
  startFrom?: string;
  limit?: string | number;
  fromDate?: string;
  toDate?: string;
}): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/application/access',
    method: 'POST',
    query: withApplicationQuery(
      {
        start: input.start,
        end: input.end,
        startFrom: input.startFrom,
        limit: input.limit,
        fromDate: input.fromDate,
        toDate: input.toDate,
      },
      input,
    ),
    body: {
      accountId: input.accountId,
      forAccount: input.forAccount,
    },
  });
}

/*
::neup.documentation::logica-account-get-application-account-roles-function
::function getApplicationAccountRoles(input)

Lists application roles for accounts.

::public

Calls the application roles bridge route using application credentials and
optional account/filter values.

::public end

::end
*/
export async function getApplicationAccountRoles(input: {
  app?: string;
  appSecret?: string;
  account?: string;
  start?: string | number;
  end?: string | number;
  startFrom?: string;
  limit?: string | number;
  fromDate?: string;
  toDate?: string;
} = {}): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/application/roles',
    method: 'GET',
    query: withApplicationQuery(input, input),
  });
}

/*
::neup.documentation::logica-account-get-application-accounts-function
::function getApplicationAccounts(input)

Lists accounts connected to an application.

::public

Calls the application users bridge route with application credentials and
optional pagination/date filters.

::public end

::end
*/
export async function getApplicationAccounts(input: {
  app?: string;
  appSecret?: string;
  offset?: string | number;
  limit?: string | number;
  start?: string | number;
  end?: string | number;
  startFrom?: string;
  fromDate?: string;
  toDate?: string;
  headers?: HeadersInit;
} = {}): Promise<NeupBridgeResponse> {
  const credentials = getApplicationCredentials(input);
  return runNeupBridgeApi({
    path: '/bridge/api.v1/application/users',
    method: 'POST',
    query: {
      offset: input.offset,
      limit: input.limit,
      start: input.start,
      end: input.end,
      startFrom: input.startFrom,
      fromDate: input.fromDate,
      toDate: input.toDate,
    },
    body: {
      appId: credentials.app,
      appSecret: credentials.appSecret,
    },
    headers: input.headers,
  });
}

function getSyncCredentials() {
  const env = getNeupBridgeEnvironment();
  return {
    neup_app_id: env.appId,
    neup_app_secret: env.appSecret,
  };
}

/*
::neup.documentation::logica-account-get-registered-application-permissions-function
::function getRegisteredApplicationPermissions()

Lists registered permissions for the configured application.

::public

Calls the app permission catalog bridge route using environment credentials.

::public end

::end
*/
export async function getRegisteredApplicationPermissions(): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/app/permissions',
    method: 'GET',
    query: getSyncCredentials(),
  });
}

/*
::neup.documentation::logica-account-sync-application-permissions-function
::function syncApplicationPermissions(permissions)

Synchronizes application permission definitions.

::public

Posts permission catalog data for the configured application to the bridge.

::public end

::end
*/
export async function syncApplicationPermissions(
  permissions: unknown,
): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/app/permissions',
    method: 'POST',
    body: {
      ...getSyncCredentials(),
      permissions,
    },
  });
}

/*
::neup.documentation::logica-account-get-registered-application-roles-function
::function getRegisteredApplicationRoles()

Lists registered roles for the configured application.

::public

Calls the app role catalog bridge route using environment credentials.

::public end

::end
*/
export async function getRegisteredApplicationRoles(): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/app/roles',
    method: 'GET',
    query: getSyncCredentials(),
  });
}

/*
::neup.documentation::logica-account-sync-application-roles-function
::function syncApplicationRoles(roles)

Synchronizes application role definitions.

::public

Posts role catalog data for the configured application to the bridge.

::public end

::end
*/
export async function syncApplicationRoles(roles: unknown): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/app/roles',
    method: 'POST',
    body: {
      ...getSyncCredentials(),
      roles,
    },
  });
}

type ApplicationConnectionsInput = Parameters<typeof getApplicationConnections>[0];

function createApplicationConnectionsInput(
  input: Partial<ApplicationConnectionsInput> = {},
): ApplicationConnectionsInput {
  const env = getNeupBridgeEnvironment();
  return {
    ...input,
    appId: input.appId?.trim() || env.appId,
    appSecret: input.appSecret?.trim() || env.appSecret,
  };
}

/*
::neup.documentation::logica-account-create-application-scope-function
::function createApplicationScope(applicationId)

Creates the object returned by `logica.account.application(applicationId)`.

::public

The returned object exposes application-scoped account, connection, team,
permission, role, and branding children.

::public end

::end
*/
export function createApplicationScope(applicationId: string) {
  const accountScope = function accountScope(accountId: string) {
    return {
      get(input: Omit<Parameters<typeof getApplicationAccountAccess>[0], 'app' | 'accountId'> = {}) {
        return getApplicationAccountAccess({ ...input, app: applicationId, accountId });
      },

      access: {
        get(input: Omit<Parameters<typeof getApplicationAccountAccess>[0], 'app' | 'accountId'> = {}) {
          return getApplicationAccountAccess({ ...input, app: applicationId, accountId });
        },
      },

      role: {
        list(input: Omit<Parameters<typeof getApplicationAccountRoles>[0], 'app' | 'account'> = {}) {
          return getApplicationAccountRoles({ ...input, app: applicationId, account: accountId });
        },
      },

      permission: {
        list(input: Omit<Parameters<typeof getApplicationAccountAccess>[0], 'app' | 'accountId'> = {}) {
          return getApplicationAccountAccess({ ...input, app: applicationId, accountId });
        },
      },

      connection: {
        get(input: Omit<Parameters<typeof getApplicationAccountAccess>[0], 'app' | 'accountId'> = {}) {
          return getApplicationAccountAccess({ ...input, app: applicationId, accountId });
        },
      },
    } as const;
  };

  accountScope.list = function list(input: Omit<Parameters<typeof getApplicationAccounts>[0], 'app'> = {}) {
    return getApplicationAccounts({ ...input, app: applicationId });
  };

  const connectionScope = function connectionScope(connectionId: string) {
    return {
      get(fields?: AccountFields) {
        return getAccountBasics({ connectionId, fields: normalizeAccountFields(fields) });
      },

      team: {
        list(input: Omit<Parameters<typeof getConnectionTeamMembers>[0], 'connection'> = {}) {
          return getConnectionTeamMembers({ ...input, connection: connectionId });
        },
      },
    } as const;
  };

  connectionScope.list = function list(input: Partial<ApplicationConnectionsInput> = {}) {
    return getApplicationConnections(createApplicationConnectionsInput({ ...input, appId: applicationId }));
  };

  return {
    get(input: Omit<Parameters<typeof getApplicationAccountAccessList>[0], 'app'> = {}) {
      return getApplicationAccountAccessList({ ...input, app: applicationId });
    },

    account: accountScope,
    connection: connectionScope,

    team: {
      list(input: Omit<Parameters<typeof getApplicationTeamMembers>[0], 'app'> = {}) {
        return getApplicationTeamMembers({ ...input, app: applicationId });
      },
    },

    permission: {
      list() {
        return getRegisteredApplicationPermissions();
      },

      sync(data: unknown) {
        return syncApplicationPermissions(data);
      },
    },

    role: {
      list() {
        return getRegisteredApplicationRoles();
      },

      sync(data: unknown) {
        return syncApplicationRoles(data);
      },
    },

    branding: {
      get() {
        return getApplicationLogo();
      },
    },
  } as const;
}

/*
::neup.documentation::logica-account-application-object
::function application(applicationId)

Application child object for `logica.account.application`.

::public

Call this function with an application id for scoped application operations, or
use its attached collection children such as `.account`, `.connection`,
`.permission`, `.role`, and `.branding`.

::public end

::end
*/
export const application = function application(applicationId: string) {
  return createApplicationScope(applicationId);
};

application.list = function list(input: Parameters<typeof getApplicationAccountAccessList>[0] = {}) {
  return getApplicationAccountAccessList(input);
};

application.account = {
  list(input: Parameters<typeof getApplicationAccounts>[0] = {}) {
    return getApplicationAccounts(input);
  },
};

application.connection = {
  list(input: Partial<ApplicationConnectionsInput> = {}) {
    return getApplicationConnections(createApplicationConnectionsInput(input));
  },
};

application.team = {
  list(input: Parameters<typeof getApplicationTeamMembers>[0]) {
    return getApplicationTeamMembers(input);
  },
};

application.permission = {
  list() {
    return getRegisteredApplicationPermissions();
  },

  sync(data: unknown) {
    return syncApplicationPermissions(data);
  },
};

application.role = {
  list() {
    return getRegisteredApplicationRoles();
  },

  sync(data: unknown) {
    return syncApplicationRoles(data);
  },
};

application.branding = {
  get() {
    return getApplicationLogo();
  },
};
