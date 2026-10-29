/*
::neup.documentation::logica-drive-account-status
::title Logica Drive Account Status

Account-scoped drive storage status helper.

::public

Use `logica.drive.account(accountId).status()`.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';


const Basepath = 'bridge/api.v1';
const DriveStatusEndpoint = `${Basepath}/drive/status`;

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
): Promise<ApiResponse<DriveAccountStatusResponseBody>> {
  return runApi<DriveAccountStatusResponseBody>({
    baseUrl: getBaseUrl('drive'),
    path: DriveStatusEndpoint,
    query: {
      account_id: input.accountId,
    },
    cookies: { auth_account: input.authAccountToken },
    bearerToken: input.bearerToken,
  });
}
