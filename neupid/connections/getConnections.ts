/*
::neup.documentation::logica-account-connections-get-connections-module
::title Logica Connections Get Connections Helper

Portable wrappers for `/bridge/api.v1/accounts` and `/bridge/api.v1/application/users`.

::public

Use this module to fetch accounts that can create connections and accounts whose application connections already exist.

::public end

::end
*/

import baseJson from '@/logica/neupid/base.json';
import type { NeupBridgeResponse } from '@/logica/core/api-runner';

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

export async function getConnections(
  input: GetNeupConnectionsInput,
): Promise<NeupBridgeResponse<GetNeupConnectionsResponseBody>> {
  const url = new URL('/bridge/api.v1/application/users', baseJson.baseEndpoint);

  if (input.offset !== null && input.offset !== undefined && input.offset !== '') {
    url.searchParams.set('offset', String(input.offset));
  }
  if (input.limit !== null && input.limit !== undefined && input.limit !== '') {
    url.searchParams.set('limit', String(input.limit));
  }
  if (input.start !== null && input.start !== undefined && input.start !== '') {
    url.searchParams.set('start', String(input.start));
  }
  if (input.end !== null && input.end !== undefined && input.end !== '') {
    url.searchParams.set('end', String(input.end));
  }
  if (input.startFrom?.trim()) {
    url.searchParams.set('startFrom', input.startFrom.trim());
  }
  if (input.fromDate?.trim()) {
    url.searchParams.set('fromDate', input.fromDate.trim());
  }
  if (input.toDate?.trim()) {
    url.searchParams.set('toDate', input.toDate.trim());
  }

  const headers = new Headers(input.headers);
  headers.set('content-type', 'application/json');

  const response = await fetch(url.toString(), {
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

export async function getCreatableConnections(
  input: GetCreatableConnectionsInput = {},
): Promise<NeupBridgeResponse<GetCreatableConnectionsResponseBody>> {
  const url = new URL('/bridge/api.v1/accounts', baseJson.baseEndpoint);

  if (input.bearerToken?.trim() && input.appSecret?.trim()) {
    url.searchParams.set('appSecret', input.appSecret.trim());
  }

  const headers = new Headers();

  if (input.bearerToken?.trim()) {
    headers.set('authorization', `Bearer ${input.bearerToken.trim()}`);
  }

  if (input.authAccountToken?.trim()) {
    headers.set('cookie', `auth_account=${input.authAccountToken.trim()}`);
  }

  const response = await fetch(url.toString(), {
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

export async function getCreatedConnections(
  input: GetNeupConnectionsInput,
): Promise<NeupBridgeResponse<GetNeupConnectionsResponseBody>> {
  return getConnections(input);
}

export async function getBrandConnections(
  input: GetNeupConnectionsInput,
): Promise<NeupBridgeResponse<GetNeupConnectionsResponseBody>> {
  const response = await getConnections(input);
  return filterConnectionsByType(response, 'brand');
}

export async function getIndividualConnections(
  input: GetNeupConnectionsInput,
): Promise<NeupBridgeResponse<GetNeupConnectionsResponseBody>> {
  const response = await getConnections(input);
  return filterConnectionsByType(response, 'individual');
}

export async function getDependentConnections(
  input: GetNeupConnectionsInput,
): Promise<NeupBridgeResponse<GetNeupConnectionsResponseBody>> {
  const response = await getConnections(input);
  return filterConnectionsByType(response, 'dependent');
}

export async function getSubBrandConnections(
  input: GetNeupConnectionsInput,
): Promise<NeupBridgeResponse<GetNeupConnectionsResponseBody>> {
  const response = await getConnections(input);
  return filterConnectionsByType(response, 'subbrand');
}
