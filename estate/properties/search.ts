/*
::neup.documentation::logica-estate-properties-search
::title Logica Estate Properties Search

Portable SDK operation for `GET|POST /bridge/api.v1/properties/search`.

::public

Searches properties with text and structured filters. Uses GET when the encoded
URL is at most 2,000 UTF-8 bytes and POST with the equivalent JSON search model
when it is longer.

::public end
::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';

const PropertiesSearchPath = 'bridge/api.v1/properties/search';
const MAX_GET_URL_BYTES = 2_000;

export type EstatePropertiesSearchFilters = Record<string, string | number | boolean | string[] | number[] | null | undefined>;

export type EstatePropertiesSearchInput = {
  q?: string | null;
  filters?: EstatePropertiesSearchFilters;
  offset?: number | null;
  limit?: number | null;
  statuses?: string[] | null;
  orderBy?: 'newestFirst' | 'oldestFirst' | null;
  agencyId?: string | null;
  agentId?: string | null;
};

export type EstatePropertiesSearchResponseBody = {
  success: boolean;
  properties?: unknown[];
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
function normalizeSearchInput(input: EstatePropertiesSearchInput): NormalizedSearchInput {
  const filters: NormalizedSearchInput['filters'] = {};
  for (const [key, value] of Object.entries(input.filters ?? {})) {
    if (value === null || value === undefined) continue;
    filters[key] = Array.isArray(value) ? value.map(String) : value;
  }

  return {
    ...(input.q != null ? { q: input.q } : {}),
    filters,
    offset: Number.isInteger(input.offset) && Number(input.offset) >= 0 ? Number(input.offset) : 0,
    limit: Number.isInteger(input.limit) && Number(input.limit) > 0 ? Number(input.limit) : 15,
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
  const url = new URL(`${getBaseUrl('estate')}/${PropertiesSearchPath}`);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value));
  return new TextEncoder().encode(url.toString()).byteLength;
}

// Search properties using GET for short URLs and JSON POST for longer requests.
export async function searchEstateProperties(
  input: EstatePropertiesSearchInput = {},
): Promise<ApiResponse<EstatePropertiesSearchResponseBody>> {
  const normalizedInput = normalizeSearchInput(input);
  const query = buildGetQuery(normalizedInput);
  const baseUrl = getBaseUrl('estate');

  if (getEncodedUrlByteLength(query) <= MAX_GET_URL_BYTES) {
    return runApi<EstatePropertiesSearchResponseBody>({
      baseUrl,
      path: PropertiesSearchPath,
      query,
    });
  }

  return runApi<EstatePropertiesSearchResponseBody>({
    baseUrl,
    path: PropertiesSearchPath,
    method: 'POST',
    body: normalizedInput,
  });
}

export const properties = {
  search: searchEstateProperties,
} as const;

export default properties;
