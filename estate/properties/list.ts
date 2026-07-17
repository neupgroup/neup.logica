/*
::neup.documentation::logica-estate-properties-list
::title Logica Estate Property List Helper

Portable SDK helper for `GET /bridge/api.v1/property/list`.

::public

Fetches active bridge property payloads for exactly one agency or account.

::public end

::end
*/

import baseJson from '@/logica/estate/base.json';
import type { NeupBridgeResponse } from '@/logica/core/api-runner';

export type EstatePropertyListInput = {
  agencyId?: string | null;
  accountId?: string | null;
  fields?: string[] | string | null;
  limit?: number | null;
  offset?: number | null;
};

export type EstatePropertyListResponseBody = {
  success: boolean;
  filter?: { type: 'agency' | 'account' | 'agent'; accountId?: string };
  properties?: unknown[];
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
};

function serializeFields(fields: EstatePropertyListInput['fields']): string | undefined {
  if (!fields) return undefined;
  if (Array.isArray(fields)) return fields.map((field) => field.trim()).filter(Boolean).join(',');
  return fields.trim() || undefined;
}

export async function listEstateProperties(
  input: EstatePropertyListInput,
): Promise<NeupBridgeResponse<EstatePropertyListResponseBody>> {
  const url = new URL('/bridge/api.v1/property/list', baseJson.baseEndpoint);
  const query = {
    agency_id: input.agencyId,
    account_id: input.accountId,
    fields: serializeFields(input.fields),
    limit: input.limit,
    offset: input.offset,
  };

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as EstatePropertyListResponseBody;

  return {
    ok: response.ok,
    status: response.status,
    body,
    headers: response.headers,
  };
}
