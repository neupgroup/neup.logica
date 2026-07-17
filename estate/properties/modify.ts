/*
::neup.documentation::logica-estate-properties-modify
::title Logica Estate Property Modify Helper

Portable SDK helper for `POST /bridge/api.v1/property/edit`.

::public

Submits property edits as an awaiting-review request. Use `requestId` for a
pending create draft or `propertyId` for an approved property.

::public end

::end
*/

import baseJson from '@/logica/estate/base.json';
import type { NeupBridgeResponse } from '@/logica/core/api-runner';

export type ModifyEstatePropertyInput = {
  requestId?: string | null;
  propertyId?: string | null;
  accountId?: string | null;
  postingAgencyId?: string | null;
  workingProfileId?: string | null;
  property: Record<string, unknown>;
};

export type ModifyEstatePropertyResponseBody = {
  success: boolean;
  requestId?: string;
  status?: 'awaiting review' | string;
  error?: string;
  desc?: string[];
};

export async function modifyEstateProperty(
  input: ModifyEstatePropertyInput,
): Promise<NeupBridgeResponse<ModifyEstatePropertyResponseBody>> {
  const url = new URL('/bridge/api.v1/property/edit', baseJson.baseEndpoint);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      requestId: input.requestId,
      propertyId: input.propertyId,
      accountId: input.accountId,
      postingAgencyId: input.postingAgencyId,
      workingProfileId: input.workingProfileId,
      property: input.property,
    }),
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as ModifyEstatePropertyResponseBody;

  return {
    ok: response.ok,
    status: response.status,
    body,
    headers: response.headers,
  };
}
