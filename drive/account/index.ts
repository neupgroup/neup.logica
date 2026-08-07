/*
::neup.documentation::logica-drive-account-object
::title Logica Drive Account Object

Callable account object for the drive SDK.

::public

Use `logica.drive.account(accountId).file.*` and
`logica.drive.account(accountId).status()`.

::public end

::end
*/

import { createDriveAccountScope, type DriveAccountScope } from '@/logica/drive/account/scope';

export function account(accountId: string) {
  return createDriveAccountScope(accountId);
}

export type { DriveAccountScope };

export default account;
