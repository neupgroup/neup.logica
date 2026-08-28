/*
::neup.documentation::logica-account-account-application-file
::title Logica Account Application Scope File

Builds application operations for one account instance.

::public

This file backs `logica.account(accountId).application`.

::public end

::end
*/

import { getApplicationAccountAccess } from '#/logica/account/application';

/*
::neup.documentation::logica-account-create-account-application-function
::function createAccountApplication(accountId)

Creates the application child object for one account.

::public

The returned object lists application access records for the account.

::public end

::end
*/
export function createAccountApplication(accountId: string) {
  return {
    list(input: Omit<Parameters<typeof getApplicationAccountAccess>[0], 'accountId'>) {
      return getApplicationAccountAccess({ ...input, accountId });
    },
  } as const;
}

/*
::neup.documentation::logica-account-application-scope-type
::type AccountApplicationScope

Return type for `createAccountApplication`.

::public

Represents the shape of `logica.account(accountId).application`.

::public end

::end
*/
export type AccountApplicationScope = ReturnType<typeof createAccountApplication>;
