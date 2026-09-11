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

import { account } from '@neup/logica/drive/account';
import { getBaseUrl } from '@neup/logica/baseurl';

function getBasepath() {
  return getBaseUrl('drive');
}

export const drive = {
  account,
  getBasepath,
} as const;

export { account };
export { getBasepath };
export { requestDriveApi } from '@neup/logica/drive/api';
export type { DriveApiResponse } from '@neup/logica/drive/api';

export default drive;
