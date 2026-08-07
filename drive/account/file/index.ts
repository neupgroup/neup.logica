/*
::neup.documentation::logica-drive-account-file-object
::title Logica Drive Account File Object

Account-scoped file object for the drive SDK.

::public

Use `logica.drive.account(accountId).file.get(...)` to resolve one file URL and
`logica.drive.account(accountId).file.list(...)` to list drive files.

::public end

::end
*/

import {
  getDriveAccountFile,
  type DriveAccountFileGetInput,
  type DriveAccountFileGetResponseBody,
} from '@/logica/drive/account/file/get';
import {
  listDriveAccountFiles,
  type DriveAccountFileListInput,
  type DriveAccountFileListResponseBody,
} from '@/logica/drive/account/file/list';
import type { DriveApiResponse } from '@/logica/drive/api';

export function createDriveAccountFileScope(accountId: string) {
  return {
    get(input: Omit<DriveAccountFileGetInput, 'accountId'> = {}) {
      return getDriveAccountFile({ ...input, accountId });
    },

    list(input: Omit<DriveAccountFileListInput, 'accountId'> = {}) {
      return listDriveAccountFiles({ ...input, accountId });
    },
  } as const;
}

export type DriveAccountFileScope = ReturnType<typeof createDriveAccountFileScope>;
export type { DriveAccountFileGetInput, DriveAccountFileGetResponseBody, DriveAccountFileListInput, DriveAccountFileListResponseBody, DriveApiResponse };
