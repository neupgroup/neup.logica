/*
::neup.documentation::logica-drive-object-api
::title Logica Drive Object API

Drive object composed from nested drive domain folders.

::public

Use `logica.drive.account(accountId).*` for account-scoped drive operations.
Use `logica.drive.getBasepath()` to resolve the canonical Drive API origin for
portable clients.

::public end

::end
*/

import { account } from '@/logica/drive/account';
import baseJson from '@/logica/base.json';

export function getBasepath() {
  return baseJson.drive;
}

export const drive = {
  account,
  getBasepath,
} as const;

export { account };
export { getBasepath };
export { requestDriveApi } from '@/logica/drive/api';
export type { DriveApiResponse } from '@/logica/drive/api';

export default drive;
