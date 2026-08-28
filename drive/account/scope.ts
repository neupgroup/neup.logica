/*
::neup.documentation::logica-drive-account-scope-file
::title Logica Drive Account Scope File

Builds one drive account scope for `logica.drive.account(accountId)`.

::public

This file composes account-scoped file and storage status children.

::public end

::end
*/

import { createDriveAccountFileScope } from '#/logica/drive/account/file';
import { getDriveAccountStatus } from '#/logica/drive/account/status';

export function createDriveAccountScope(accountId: string) {
  return {
    file: createDriveAccountFileScope(accountId),

    status() {
      return getDriveAccountStatus({ accountId });
    },
  } as const;
}

export type DriveAccountScope = ReturnType<typeof createDriveAccountScope>;
