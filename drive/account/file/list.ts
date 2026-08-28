/*
::neup.documentation::logica-drive-account-file-list
::title Logica Drive Account File List

Account-scoped drive file list helper.

::public

Use `logica.drive.account(accountId).file.list()` to list all drive files for
one account, or pass `path` to scope the listing to one folder.

::public end

::end
*/

import { requestDriveApi, type DriveApiResponse } from '#/logica/drive/api';
import type { DriveAccountFileRecord } from '#/logica/drive/account/file/get';

export type DriveAccountFileListResponseBody = DriveAccountFileRecord[];

export type DriveAccountFileListInput = {
  accountId: string;
  path?: string;
  limit?: number;
  authAccountToken?: string | null;
  bearerToken?: string | null;
};

export function listDriveAccountFiles(
  input: DriveAccountFileListInput,
): Promise<DriveApiResponse<DriveAccountFileListResponseBody>> {
  return requestDriveApi<DriveAccountFileListResponseBody>({
    path: '/bridge/api.v1/drive/files',
    query: {
      account_id: input.accountId,
      path: input.path,
      limit: input.limit,
    },
    authAccountToken: input.authAccountToken,
    bearerToken: input.bearerToken,
  });
}
