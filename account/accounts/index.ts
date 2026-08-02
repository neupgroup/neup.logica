/*
::neup.documentation::logica-account-accounts-index-module
::title Logica Accounts Exports
Entry point for account-list bridge helpers.

::public
Import from this file when you want accessible-account bridge helpers grouped under one namespace.
::public end

::end
*/

import { getAccounts } from '@/logica/account/accounts/getAccounts';
import type { NeupBridgeResponse } from '@/logica/account/api';

type AccountListInput = Parameters<typeof getAccounts>[0];

function filterAccountListByType<TResponse extends NeupBridgeResponse<{ accounts?: { accountType: string }[] }>>(
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

async function listAccountsByType(
  accountType: string,
  input: AccountListInput = {},
): ReturnType<typeof getAccounts> {
  const response = await getAccounts(input);
  return filterAccountListByType(response, accountType);
}

/*
::neup.documentation::logica-account-create-account-type-scope-function
::function createAccountTypeScope(accountType)

Creates an account type listing child object.

::public

Backs `logica.account.type(accountType).list()` and fixed root account type
children.

::public end

::end
*/
export function createAccountTypeScope(accountType: string) {
  return {
    list(input: AccountListInput = {}) {
      return listAccountsByType(accountType, input);
    },
  } as const;
}

/*
::neup.documentation::logica-account-accounts-object
::function accounts

Account collection object used by the root account facade.

::public

Provides list and account-type listing functions that are attached to
`logica.account`.

::public end

::end
*/
export const accounts = {
  list(input: AccountListInput = {}) {
    return getAccounts(input);
  },

  type: createAccountTypeScope,
  brand: createAccountTypeScope('brand'),
  individual: createAccountTypeScope('individual'),
  dependent: createAccountTypeScope('dependent'),
  subbrand: createAccountTypeScope('subbrand'),
} as const;
