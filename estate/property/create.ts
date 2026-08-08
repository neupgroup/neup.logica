/*
::neup.documentation::logica-estate-property-create
::title Logica Estate Property Create Helper

Portable SDK helper for `POST /bridge/api.v1/property/create`.

::public

Submits a property creation payload as an awaiting-review draft.

::public end

::end
*/

import baseJson from '@/logica/estate/base.json';
import { url } from '@/core/helpers/link/url';
import type { EstateApiResponse } from '@/logica/estate/api';

export type CreateEstatePropertyInput = {
  accountId: string;
  property: Record<string, unknown>;
  postingAgencyId?: string | null;
  workingProfileId?: string | null;
};

export type CreateEstatePropertyResponseBody = {
  success: boolean;
  requestId?: string;
  status?: 'awaiting review' | string;
  error?: string;
  desc?: string[];
};

export async function createEstateProperty(
  input: CreateEstatePropertyInput,
): Promise<EstateApiResponse<CreateEstatePropertyResponseBody>> {
  const response = await fetch(url().setBasePath(baseJson.baseEndpoint).addCustomPath('/bridge/api.v1/property/create').get(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      accountId: input.accountId,
      postingAgencyId: input.postingAgencyId,
      workingProfileId: input.workingProfileId,
      property: input.property,
    }),
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as CreateEstatePropertyResponseBody;

  return {
    ok: response.ok,
    status: response.status,
    body,
    headers: response.headers,
  };
}
