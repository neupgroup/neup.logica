/*
::neup.documentation::logica-account-role-file
::title Logica Account Role Scope File

Builds role operations for one account instance.

::public

This file backs `logica.account(accountId).role`.

::public end

::end
*/

import { getApplicationAccountRoles } from '@/logica/account/application';

/*
::neup.documentation::logica-account-create-account-role-function
::function createAccountRole(accountId)

Creates the role child object for one account.

::public

The returned object lists application roles assigned to or associated with the
account.

::public end

::end
*/
export function createAccountRole(accountId: string) {
  return {
    list(input: Omit<Parameters<typeof getApplicationAccountRoles>[0], 'account'> = {}) {
      return getApplicationAccountRoles({ ...input, account: accountId });
    },
  } as const;
}

/*
::neup.documentation::logica-account-role-scope-type
::type AccountRoleScope

Return type for `createAccountRole`.

::public

Represents the shape of `logica.account(accountId).role`.

::public end

::end
*/
export type AccountRoleScope = ReturnType<typeof createAccountRole>;
