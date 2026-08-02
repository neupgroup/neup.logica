/*
::neup.documentation::logica-account-scope-file
::title Logica Account Scope File

Builds one account instance scope for `logica.account(accountId)`.

::public

This file composes one account's child objects: basics, profile, access,
permission, role, connection, and application.

::public end

::end
*/

import { createAccountAccess } from '@/logica/account/access';
import { createAccountApplication } from '@/logica/account/account-application';
import { createAccountConnection } from '@/logica/account/account-connection';
import { normalizeAccountFields, type AccountFields } from '@/logica/account/fields';
import { getAccountBasics } from '@/logica/account/lookup';
import { createAccountProfile } from '@/logica/account/profile';
import { createAccountRole } from '@/logica/account/role';

/*
::neup.documentation::logica-account-create-account-scope-function
::function createAccountScope(accountId)

Creates the object returned by `logica.account(accountId)`.

::public

The returned object is scoped to one account id and exposes account-specific
children instead of root-level collection operations.

::public end

::end
*/
export function createAccountScope(accountId: string) {
  const access = createAccountAccess(accountId);

  return {
    get(fields?: AccountFields) {
      return getAccountBasics({ accountId, fields: normalizeAccountFields(fields) });
    },

    basics: {
      get(fields?: AccountFields) {
        return getAccountBasics({ accountId, fields: normalizeAccountFields(fields) });
      },
    },

    profile: createAccountProfile(accountId),
    access,
    permission: access.permission,
    role: createAccountRole(accountId),
    connection: createAccountConnection(accountId),
    application: createAccountApplication(accountId),
  } as const;
}

/*
::neup.documentation::logica-account-scope-type
::type AccountScope

Return type for one account instance scope.

::public

Use this type when a caller stores or accepts the object returned by
`logica.account(accountId)`.

::public end

::end
*/
export type AccountScope = ReturnType<typeof createAccountScope>;
