/*
::neup.documentation::logica-account-connections-index-module
::title Logica Connections Exports

Entry point for account-connection bridge helpers.

::public

Import from this file when you want connection-oriented account and lookup helpers grouped under one namespace.

::public end

::end
*/

import {
  getApplicationConnections,
  getConnectableAccounts,
  getConnectedBrandAccounts,
  getConnectedDependentAccounts,
  getConnectedIndividualAccounts,
  getConnectedSubBrandAccounts,
} from '@/logica/account/connections/getConnections';
import { getAccountBasics } from '@/logica/account/lookup';
import {
  getConnectionTeamMemberAccess,
  getConnectionTeamMembers,
} from '@/logica/account/access';
import { getNeupBridgeEnvironment } from '@/logica/account/api';
import { normalizeAccountFields, type AccountFields } from '@/logica/account/fields';

type ApplicationConnectionsInput = Parameters<typeof getApplicationConnections>[0];

function getApplicationCredentials(input: Partial<ApplicationConnectionsInput> = {}) {
  const env = getNeupBridgeEnvironment();
  return {
    appId: input.appId?.trim() || env.appId,
    appSecret: input.appSecret?.trim() || env.appSecret,
  };
}

function createApplicationConnectionsInput(
  input: Partial<ApplicationConnectionsInput> = {},
): ApplicationConnectionsInput {
  return {
    ...input,
    ...getApplicationCredentials(input),
  };
}

/*
::neup.documentation::logica-account-create-connection-scope-function
::function createConnectionScope(connectionId)

Creates the object returned by `logica.account.connection(connectionId)`.

::public

The returned object exposes connection lookup, account lookup, and team access
children for one connection id.

::public end

::end
*/
export function createConnectionScope(connectionId: string) {
  const team = function team(memberAccountId: string) {
    return {
      get(input: Omit<Parameters<typeof getConnectionTeamMemberAccess>[0], 'connection' | 'profile'> = {}) {
        return getConnectionTeamMemberAccess({ ...input, connection: connectionId, profile: memberAccountId });
      },

      access: {
        get(input: Omit<Parameters<typeof getConnectionTeamMemberAccess>[0], 'connection' | 'profile'> = {}) {
          return getConnectionTeamMemberAccess({ ...input, connection: connectionId, profile: memberAccountId });
        },
      },
    } as const;
  };

  team.list = function list(input: Omit<Parameters<typeof getConnectionTeamMembers>[0], 'connection'> = {}) {
    return getConnectionTeamMembers({ ...input, connection: connectionId });
  };

  return {
    get(fields?: AccountFields) {
      return getAccountBasics({ connectionId, fields: normalizeAccountFields(fields) });
    },

    account: {
      get(fields?: AccountFields) {
        return getAccountBasics({ connectionId, fields: normalizeAccountFields(fields) });
      },
    },

    team,
  } as const;
}

/*
::neup.documentation::logica-account-connection-object
::function connection(connectionId)

Connection child object for `logica.account.connection`.

::public

Call this function with a connection id for scoped connection operations, or use
its attached collection/type listing children.

::public end

::end
*/
export const connection = function connection(connectionId: string) {
  return createConnectionScope(connectionId);
};

connection.list = function list(input: Partial<ApplicationConnectionsInput> = {}) {
  return getApplicationConnections(createApplicationConnectionsInput(input));
};

connection.connectable = {
  list(input: Parameters<typeof getConnectableAccounts>[0] = {}) {
    return getConnectableAccounts(input);
  },
};

connection.type = function type(accountType: 'brand' | 'individual' | 'dependent' | 'subbrand') {
  return {
    list(input: Partial<ApplicationConnectionsInput> = {}) {
      const normalizedInput = createApplicationConnectionsInput(input);
      if (accountType === 'brand') return getConnectedBrandAccounts(normalizedInput);
      if (accountType === 'individual') return getConnectedIndividualAccounts(normalizedInput);
      if (accountType === 'dependent') return getConnectedDependentAccounts(normalizedInput);
      return getConnectedSubBrandAccounts(normalizedInput);
    },
  } as const;
};

connection.brand = connection.type('brand');
connection.individual = connection.type('individual');
connection.dependent = connection.type('dependent');
connection.subbrand = connection.type('subbrand');
