/*
::neup.documentation::logica-estate-listings-search
::title Logica Estate Listings Search

Portable SDK operation for `GET|POST /bridge/api.v1/listings/search`.

::public

Searches listings with text and structured filters. Uses GET when the encoded
URL is at most 2,000 UTF-8 bytes and POST with the equivalent JSON search model
when it is longer.

::public end
::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { EstateListingRecord } from '@neup/logica/estate/types';

const ListingsSearchPath = 'bridge/api.v1/listings/search';
const MAX_GET_URL_BYTES = 2_000;

export type EstateListingsSearchFilters = Record<string, string | number | boolean | string[] | number[] | null | undefined>;

export type EstateListingsSearchInput = {
  q?: string | null;
  filters?: EstateListingsSearchFilters;
  offset?: number | null;
  limit?: number | null;
  statuses?: string[] | null;
  orderBy?: 'newestFirst' | 'oldestFirst' | null;
  agencyId?: string | null;
  agentId?: string | null;
};

export type EstateListingsSearchResponseBody = {
  success: boolean;
  listings?: EstateListingRecord[];
  totalCount?: number;
  offset?: number;
  limit?: number;
  hasMore?: boolean;
  appliedFilters?: Record<string, unknown>;
  error?: string;
  details?: Record<string, string[]>;
};

type NormalizedSearchInput = {
  q?: string;
  filters: Record<string, string | number | boolean | string[]>;
  offset: number;
  limit: number;
  statuses?: string[];
  orderBy?: 'newestFirst' | 'oldestFirst';
  agencyId?: string;
  agentId?: string;
};

// Remove absent values and normalize lists before choosing the HTTP transport.
function normalizeSearchInput(input: EstateListingsSearchInput): NormalizedSearchInput {
  const filters: NormalizedSearchInput['filters'] = {};
  for (const [key, value] of Object.entries(input.filters ?? {})) {
    if (value === null || value === undefined) continue;
    filters[key] = Array.isArray(value) ? value.map(String) : value;
  }

  return {
    ...(input.q != null ? { q: input.q } : {}),
    filters,
    offset: Number.isInteger(input.offset) && Number(input.offset) >= 0 ? Number(input.offset) : 0,
    limit: Number.isInteger(input.limit) && Number(input.limit) > 0 ? Math.min(Number(input.limit), 15) : 15,
    ...(input.statuses?.length ? { statuses: input.statuses.map(String) } : {}),
    ...(input.orderBy ? { orderBy: input.orderBy } : {}),
    ...(input.agencyId ? { agencyId: input.agencyId } : {}),
    ...(input.agentId ? { agentId: input.agentId } : {}),
  };
}

// Convert a normalized query into GET parameters while preserving list syntax.
function buildGetQuery(input: NormalizedSearchInput): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    offset: input.offset,
    limit: input.limit,
  };

  if (input.q !== undefined) query.q = input.q;
  if (input.statuses?.length) query.statuses = input.statuses.join(',');
  if (input.orderBy) query.orderBy = input.orderBy;
  if (input.agencyId) query.agency = input.agencyId;
  if (input.agentId) query.agent = input.agentId;

  for (const [key, value] of Object.entries(input.filters)) {
    query[key] = Array.isArray(value) ? value.join(',') : value;
  }

  return query;
}

// Measure the fully encoded request URL using the project's 2,000-byte budget.
function getEncodedUrlByteLength(query: Record<string, string | number | boolean>): number {
  const url = new URL(`${getBaseUrl('estate')}/${ListingsSearchPath}`);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value));
  return new TextEncoder().encode(url.toString()).byteLength;
}

// Search listings using GET for short URLs and JSON POST for longer requests.
export async function searchEstateListings(
  input: EstateListingsSearchInput = {},
): Promise<ApiResponse<EstateListingsSearchResponseBody>> {
  const normalizedInput = normalizeSearchInput(input);
  const query = buildGetQuery(normalizedInput);
  const baseUrl = getBaseUrl('estate');

  if (getEncodedUrlByteLength(query) <= MAX_GET_URL_BYTES) {
    return runApi<EstateListingsSearchResponseBody>({
      baseUrl,
      path: ListingsSearchPath,
      query,
    });
  }

  return runApi<EstateListingsSearchResponseBody>({
    baseUrl,
    path: ListingsSearchPath,
    method: 'POST',
    body: normalizedInput,
  });
}

export const listingsSearch = {
  search: searchEstateListings,
} as const;

export default listingsSearch;
