/*
::neup.documentation::logica-account-object-api
::title Logica Account Object API

Account object composed from account domain files and folders.

::public

Use `logica.account(accountId).*` for one account's scoped operations.
Use child objects such as `logica.account.auth`, `logica.account.current`,
`logica.account.lookup`, `logica.account.linked`, `logica.account.accessible`,
`logica.account.connection`, and `logica.account.application` for root-level
account operations.

::public end

::end
*/

import { auth } from '@neup/logica/account/auth';
import { current } from '@neup/logica/account/current';
import { accessible } from '@neup/logica/account/access';
import { accounts } from '@neup/logica/account/accounts';
import { application } from '@neup/logica/account/application';
import { connection } from '@neup/logica/account/connections';
import { linked } from '@neup/logica/account/linked';
import { lookup } from '@neup/logica/account/lookup';
import { self } from '@neup/logica/account/self';
import { getMembers, getMember, getTeams, getTeam } from '@neup/logica/account/team';
import { createAccountScope, type AccountScope } from '@neup/logica/account/scope';

/*
::neup.documentation::logica-account-function
::function account(accountId)

Returns one account instance object.

::public

Call `logica.account(accountId)` to move from the root account object into
account-specific children such as `profile`, `access`, `role`, `connection`,
and `application`.

::public end

::end
*/
export function account(accountId: string) {
  return createAccountScope(accountId);
}

account.auth = auth;
account.current = current;
account.lookup = lookup;
account.linked = linked;
account.accessible = accessible;
account.connection = connection;
account.application = application;
account.self = self;
account.team = { getMembers, getMember, getTeams, getTeam };

account.list = accounts.list;
account.type = accounts.type;
account.brand = accounts.brand;
account.individual = accounts.individual;
account.dependent = accounts.dependent;
account.subbrand = accounts.subbrand;

/*
::neup.documentation::logica-account-scope-reexport-type
::type AccountScope

Type for the object returned by `logica.account(accountId)`.

::public

This type is exported from the root account object module for consumers that
need to type account-instance values without importing child implementation
modules.

::public end

::end
*/
export type { AccountScope };

export default account;
