/*
::neup.documentation::logica-estate-properties-search
::title Logica Estate Property Search Helper

Portable SDK helper for `GET /bridge/api.v1/property/search`.

::public

Searches active estate properties using bridge query parameters.

::public end

::end
*/

import baseJson from '@/logica/estate/base.json';
import type { NeupBridgeResponse } from '@/logica/core/api-runner';

export type SearchEstatePropertiesInput = {
  q?: string | null;
  page?: number | null;
  limit?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  location?: string | null;
  purpose?: string[] | string | null;
  category?: string[] | string | null;
  type?: string[] | string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  minBedrooms?: number | null;
  maxBedrooms?: number | null;
  minBathrooms?: number | null;
  maxBathrooms?: number | null;
  agencyName?: string | null;
  listingAgent?: string | null;
  isOwnerListing?: boolean | null;
  tags?: string[] | string | null;
};

export type SearchEstatePropertiesResponseBody = {
  success: boolean;
  properties?: unknown[];
  totalCount?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  appliedFilters?: Record<string, unknown>;
  error?: string;
  details?: Record<string, string[]>;
};

function serializeList(value: string[] | string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.map((entry) => entry.trim()).filter(Boolean).join(',');
  return value.trim() || undefined;
}

export async function searchEstateProperties(
  input: SearchEstatePropertiesInput = {},
): Promise<NeupBridgeResponse<SearchEstatePropertiesResponseBody>> {
  const url = new URL('/bridge/api.v1/property/search', baseJson.baseEndpoint);
  const query = {
    q: input.q,
    page: input.page,
    limit: input.limit,
    minPrice: input.minPrice,
    maxPrice: input.maxPrice,
    location: input.location,
    purpose: serializeList(input.purpose),
    category: serializeList(input.category),
    type: serializeList(input.type),
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    minBedrooms: input.minBedrooms,
    maxBedrooms: input.maxBedrooms,
    minBathrooms: input.minBathrooms,
    maxBathrooms: input.maxBathrooms,
    agencyName: input.agencyName,
    listingAgent: input.listingAgent,
    isOwnerListing: input.isOwnerListing,
    tags: serializeList(input.tags),
  };

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as SearchEstatePropertiesResponseBody;

  return {
    ok: response.ok,
    status: response.status,
    body,
    headers: response.headers,
  };
}
