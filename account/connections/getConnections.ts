/*
::neup.documentation::logica-account-connections-get-connections-module
::title Logica Connections Get Connections Helper

Portable wrappers for `/bridge/api.v1/accounts` and `/bridge/api.v1/application/users`.

::public

Use this module to fetch accounts that can create connections and accounts whose application connections already exist.

::public end

::end
*/

import { createNeupBridgeUrl, type NeupBridgeResponse } from '@/logica/account/api';
import { url } from '@/core/helpers/link/url';

type NeupConnection = {
  connectionId: string;
  accountId: string;
  neupId: string | null;
  displayName: string | null;
  displayImage: string | null;
  accountType: string;
  isVerified: boolean;
  accountCreatedAt: string;
  connectedAt: string;
  connectionStatus: string;
};

type GetNeupConnectionsResponseBody = {
  success: boolean;
  columns?: string[];
  data?: NeupConnection[];
  meta?: {
    total: number;
    returned: number;
    startedAt: string | null;
    endedAt: string | null;
  };
  error?: string;
};

type GetNeupConnectionsInput = {
  appId: string;
  appSecret: string;
  offset?: string | number | null;
  limit?: string | number | null;
  start?: string | number | null;
  end?: string | number | null;
  startFrom?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  headers?: HeadersInit;
};

type GetCreatableConnectionsInput = {
  authAccountToken?: string | null;
  bearerToken?: string | null;
  appSecret?: string | null;
};

type CreatableConnectionAccount = {
  id: string;
  displayName: string | null;
  displayImage: string | null;
  status: string | null;
  isVerified: boolean;
  accountType: string;
  lastActivityAt: string | null;
  neupId: string | null;
  permissions: string[];
};

type GetCreatableConnectionsResponseBody = {
  success: boolean;
  accounts?: CreatableConnectionAccount[];
  error?: string;
};

function filterConnectionsByType(
  response: NeupBridgeResponse<GetNeupConnectionsResponseBody>,
  accountType: string,
): NeupBridgeResponse<GetNeupConnectionsResponseBody> {
  return {
    ...response,
    body: {
      ...response.body,
      data: response.body.data?.filter(
        (connection) => connection.accountType.trim().toLowerCase() === accountType,
      ),
    },
    headers: response.headers,
  };
}

/*
::neup.documentation::logica-account-get-application-connections-function
::function getApplicationConnections(input)

Lists application connections.

::public

Calls the application users bridge route with application credentials and
optional pagination/date filters.

::public end

::end
*/
export async function getApplicationConnections(
  input: GetNeupConnectionsInput,
): Promise<NeupBridgeResponse<GetNeupConnectionsResponseBody>> {
  const requestUrl = url(createNeupBridgeUrl('/bridge/api.v1/application/users'))
    .addParams('offset', input.offset)
    .addParams('limit', input.limit)
    .addParams('start', input.start)
    .addParams('end', input.end)
    .addParams('startFrom', input.startFrom?.trim() || null)
    .addParams('fromDate', input.fromDate?.trim() || null)
    .addParams('toDate', input.toDate?.trim() || null);

  const headers = new Headers(input.headers);
  headers.set('content-type', 'application/json');

  const response = await fetch(requestUrl.get(), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      appId: input.appId,
      appSecret: input.appSecret,
    }),
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as GetNeupConnectionsResponseBody;

  return {
    ok: response.ok,
    status: response.status,
    body,
    headers: response.headers,
  };
}

/*
::neup.documentation::logica-account-get-connectable-accounts-function
::function getConnectableAccounts(input)

Lists accounts that can be connected.

::public

Calls the accounts bridge route with auth-account or bearer credentials.

::public end

::end
*/
export async function getConnectableAccounts(
  input: GetCreatableConnectionsInput = {},
): Promise<NeupBridgeResponse<GetCreatableConnectionsResponseBody>> {
  const requestUrl = url(createNeupBridgeUrl('/bridge/api.v1/accounts'))
    .addParams('appSecret', input.bearerToken?.trim() && input.appSecret?.trim() ? input.appSecret.trim() : null);

  const headers = new Headers();

  if (input.bearerToken?.trim()) {
    headers.set('authorization', `Bearer ${input.bearerToken.trim()}`);
  }

  if (input.authAccountToken?.trim()) {
    headers.set('cookie', `auth_account=${input.authAccountToken.trim()}`);
  }

  const response = await fetch(requestUrl.get(), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as GetCreatableConnectionsResponseBody;

  return {
    ok: response.ok,
    status: response.status,
    body,
    headers: response.headers,
  };
}

/*
::neup.documentation::logica-account-get-connected-brand-accounts-function
::function getConnectedBrandAccounts(input)

Lists connected brand accounts.

::public

Filters application connections to brand account records.

::public end

::end
*/
export async function getConnectedBrandAccounts(
  input: GetNeupConnectionsInput,
): Promise<NeupBridgeResponse<GetNeupConnectionsResponseBody>> {
  const response = await getApplicationConnections(input);
  return filterConnectionsByType(response, 'brand');
}

/*
::neup.documentation::logica-account-get-connected-individual-accounts-function
::function getConnectedIndividualAccounts(input)

Lists connected individual accounts.

::public

Filters application connections to individual account records.

::public end

::end
*/
export async function getConnectedIndividualAccounts(
  input: GetNeupConnectionsInput,
): Promise<NeupBridgeResponse<GetNeupConnectionsResponseBody>> {
  const response = await getApplicationConnections(input);
  return filterConnectionsByType(response, 'individual');
}

/*
::neup.documentation::logica-account-get-connected-dependent-accounts-function
::function getConnectedDependentAccounts(input)

Lists connected dependent accounts.

::public

Filters application connections to dependent account records.

::public end

::end
*/
export async function getConnectedDependentAccounts(
  input: GetNeupConnectionsInput,
): Promise<NeupBridgeResponse<GetNeupConnectionsResponseBody>> {
  const response = await getApplicationConnections(input);
  return filterConnectionsByType(response, 'dependent');
}

/*
::neup.documentation::logica-account-get-connected-subbrand-accounts-function
::function getConnectedSubBrandAccounts(input)

Lists connected subbrand accounts.

::public

Filters application connections to subbrand account records.

::public end

::end
*/
export async function getConnectedSubBrandAccounts(
  input: GetNeupConnectionsInput,
): Promise<NeupBridgeResponse<GetNeupConnectionsResponseBody>> {
  const response = await getApplicationConnections(input);
  return filterConnectionsByType(response, 'subbrand');
}
