/*
::neup.documentation::logica-account-account-connection-file
::title Logica Account Connection Scope File

Builds connection operations for one account instance.

::public

This file backs `logica.account(accountId).connection`.

::public end

::end
*/

import { getAccountInfo } from '@/logica/account/accounts/getInfo';
import { getApplicationAccountAccess } from '@/logica/account/application';
import {
  connectBrandAccount,
  type CreateInternalNeupConnectionInput,
} from '@/logica/account/connections/create';

/*
::neup.documentation::logica-account-create-account-connection-function
::function createAccountConnection(accountId)

Creates the connection child object for one account.

::public

The returned object can create an application connection, fetch basic connection
info, and list application access records for the account.

::public end

::end
*/
export function createAccountConnection(accountId: string) {
  return {
    create(input: Omit<CreateInternalNeupConnectionInput, 'accountId'>) {
      return connectBrandAccount({ ...input, accountId });
    },

    get(input: Omit<Parameters<typeof getAccountInfo>[0], 'accountId'>) {
      return getAccountInfo({ ...input, accountId });
    },

    list(input: Omit<Parameters<typeof getApplicationAccountAccess>[0], 'accountId'>) {
      return getApplicationAccountAccess({ ...input, accountId });
    },
  } as const;
}

/*
::neup.documentation::logica-account-connection-scope-type
::type AccountConnectionScope

Return type for `createAccountConnection`.

::public

Represents the shape of `logica.account(accountId).connection`.

::public end

::end
*/
export type AccountConnectionScope = ReturnType<typeof createAccountConnection>;
