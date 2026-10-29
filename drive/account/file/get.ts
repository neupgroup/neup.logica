/*
::neup.documentation::logica-drive-account-file-get
::title Logica Drive Account File Get

Account-scoped drive file URL helper.

::public

Use `logica.drive.account(accountId).file.get({ fileId })` or
`logica.drive.account(accountId).file.get({ path })`.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';


const Basepath = 'bridge/api.v1';
const DriveFileEndpoint = `${Basepath}/drive/file`;

export type DriveAccountFileRecord = {
  id: string;
  name: string;
  path: string;
  type: string;
  stored_as: string;
  folder_type: string;
  size: number;
  mimeType: string;
  status: string;
  created_on: string;
  updated_on: string;
  url: string;
  details: Record<string, unknown>;
};

export type DriveAccountFileGetResponseBody = {
  success: boolean;
  account_id: string;
  file: DriveAccountFileRecord;
};

export type DriveAccountFileGetInput = {
  accountId: string;
  fileId?: string;
  path?: string;
  expiresIn?: string | number | null;
  authAccountToken?: string | null;
  bearerToken?: string | null;
};

export function getDriveAccountFile(
  input: DriveAccountFileGetInput,
): Promise<ApiResponse<DriveAccountFileGetResponseBody>> {
  return runApi<DriveAccountFileGetResponseBody>({
    baseUrl: getBaseUrl('drive'),
    path: DriveFileEndpoint,
    query: {
      account_id: input.accountId,
      file_id: input.fileId,
      path: input.path,
      expires_in: input.expiresIn ?? undefined,
    },
    cookies: { auth_account: input.authAccountToken },
    bearerToken: input.bearerToken,
  });
}
