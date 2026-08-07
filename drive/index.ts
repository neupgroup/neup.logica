/*
::neup.documentation::logica-drive-object-api
::title Logica Drive Object API

Drive object composed from nested drive domain folders.

::public

Use `logica.drive.account(accountId).*` for account-scoped drive operations.

::public end

::end
*/

import { account } from '@/logica/drive/account';

export const drive = {
  account,
} as const;

export { account };
export { requestDriveApi } from '@/logica/drive/api';
export type { DriveApiResponse } from '@/logica/drive/api';

export default drive;
