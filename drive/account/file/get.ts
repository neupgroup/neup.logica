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

import { requestDriveApi, type DriveApiResponse } from '@/logica/drive/api';

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
): Promise<DriveApiResponse<DriveAccountFileGetResponseBody>> {
  return requestDriveApi<DriveAccountFileGetResponseBody>({
    path: '/bridge/api.v1/drive/file',
    query: {
      account_id: input.accountId,
      file_id: input.fileId,
      path: input.path,
      expires_in: input.expiresIn ?? undefined,
    },
    authAccountToken: input.authAccountToken,
    bearerToken: input.bearerToken,
  });
}
