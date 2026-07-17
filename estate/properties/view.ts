/*
::neup.documentation::logica-estate-properties-view
::title Logica Estate Property View Helper

Portable SDK helper for `GET /bridge/api.v1/property/view`.

::public

Fetches one approved property's public bridge payload by `propertyId`.

::public end

::end
*/

import baseJson from '@/logica/estate/base.json';
import type { NeupBridgeResponse } from '@/logica/core/api-runner';

export type ViewEstatePropertyInput = {
  propertyId: string;
};

export type ViewEstatePropertyResponseBody = {
  success: boolean;
  property?: unknown;
  error?: string;
};

export async function viewEstateProperty(
  input: ViewEstatePropertyInput,
): Promise<NeupBridgeResponse<ViewEstatePropertyResponseBody>> {
  const url = new URL('/bridge/api.v1/property/view', baseJson.baseEndpoint);
  url.searchParams.set('propertyId', input.propertyId);

  const response = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as ViewEstatePropertyResponseBody;

  return {
    ok: response.ok,
    status: response.status,
    body,
    headers: response.headers,
  };
}
