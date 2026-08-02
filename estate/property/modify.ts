/*
::neup.documentation::logica-estate-property-modify
::title Logica Estate Property Modify Helper

Portable SDK helper for `POST /bridge/api.v1/property/edit`.

::public

Submits property edits as an awaiting-review request. Use `requestId` for a
pending create draft or `propertyId` for an approved property.

::public end

::end
*/

import baseJson from '@/logica/estate/base.json';
import { makeUrl } from '@/core/helpers/link/url';
import type { EstateApiResponse } from '@/logica/estate/api';

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
): Promise<EstateApiResponse<ModifyEstatePropertyResponseBody>> {
  const url = makeUrl(baseJson.baseEndpoint, '/bridge/api.v1/property/edit');
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
