/*
::neup.documentation::logica-drive-account-status
::title Logica Drive Account Status

Account-scoped drive storage status helper.

::public

Use `logica.drive.account(accountId).status()`.

::public end

::end
*/

import { requestDriveApi, type DriveApiResponse } from '@/logica/drive/api';

export type DriveAccountStatusResponseBody = {
  success: boolean;
  account_id: string;
  storage: {
    bytes_used: number;
    file_count: number;
    folder_count: number;
    item_count: number;
  };
};

export type GetDriveAccountStatusInput = {
  accountId: string;
  authAccountToken?: string | null;
  bearerToken?: string | null;
};

export function getDriveAccountStatus(
  input: GetDriveAccountStatusInput,
): Promise<DriveApiResponse<DriveAccountStatusResponseBody>> {
  return requestDriveApi<DriveAccountStatusResponseBody>({
    path: '/bridge/api.v1/drive/status',
    query: {
      account_id: input.accountId,
    },
    authAccountToken: input.authAccountToken,
    bearerToken: input.bearerToken,
  });
}
