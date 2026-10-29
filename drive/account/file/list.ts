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

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { DriveAccountFileRecord } from '@neup/logica/drive/account/file/get';


const Basepath = 'bridge/api.v1';
const DriveFilesEndpoint = `${Basepath}/drive/files`;

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
): Promise<ApiResponse<DriveAccountFileListResponseBody>> {
  return runApi<DriveAccountFileListResponseBody>({
    baseUrl: getBaseUrl('drive'),
    path: DriveFilesEndpoint,
    query: {
      account_id: input.accountId,
      path: input.path,
      limit: input.limit,
    },
    cookies: { auth_account: input.authAccountToken },
    bearerToken: input.bearerToken,
  });
}
