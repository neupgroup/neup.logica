/*
::neup.documentation::logica-estate-property-list
::title Logica Estate Property List Helper

Portable SDK helper for `GET /bridge/api.v1/listings`.

::public

Fetches listing payloads with optional agency or account filtering. Without
`status`, the endpoint returns only active listings. Supply a comma-separated
value (or string array) to request other statuses, for example:
`listings.list({ accountId: 'account-id', filter: { status: ['drafts', 'pending'] } })`
sends `GET /bridge/api.v1/listings?agent=account-id&status=drafts,pending`.
`listings.list({ accountId: 'account-id', filter: { status: 'rejected' } })` requests only
rejected properties.
Pass `filter` as an object to apply property filters. Supported keys are
`status`, `id`, `ids`, `searchTerm`, `minPrice`, `maxPrice`, `location`, `purpose`,
`category`, `type`, `minArea`, `maxArea`, `agencyName`, `listingAgent`,
`isOwnerListing`, `postedAfter`, `postedBefore`, `minFloors`, `maxFloors`,
`minRoadAccess`, `maxRoadAccess`, `bedrooms`, `bathrooms`, `kitchens`,
`diningRooms`, `livingRooms`, `carParkingSpots`, `bikeParkingSpots`,
`listingBy`, `tags`, and the corresponding `min`/`max` bedroom, bathroom,
kitchen, dining room, living room, car parking, and bike parking keys.
`purpose` accepts `Sale`, `Rent`, `Lease`, or `Exchange`; `category` accepts
`House`, `Bungalow`, `Villa`, `Multiplex`, `Land`, `Apartment`, `Penthouse`,
`Commercial Space`, `Shop Space`, or `Flat`; `type` accepts `Residential`,
`Semi-Commercial`, `Commercial`, `Industrial`, or `Agricultural`. The three
list filters (`purpose`, `category`, `type`) and `listingBy`/`tags` accept an
array or a comma-separated string. `postedAfter` and `postedBefore` use ISO
8601 datetimes. Example:
`listings.list({ filter: { type: ['Residential'], purpose: ['Sale'] } })`.
The response retains each listing's own `status` and represents its primary
price as one object, for example
`{"success":true,"listings":[{"id":"listing-id","status":"PENDING","price":{"currency":"NPR","basis":"perMonth","amount":45000}}],"totalCount":1,"limit":15,"offset":0}`.

Pagination defaults to `limit: 15` and `offset: 0` when omitted. The endpoint
caps `limit` at 100.

Supported statuses are `drafts`, `pending`, `rejected`, `active`, `sold`,
`rented`, `archived`, `awaiting_creation`, and `awaiting_deletion`; `draft` and
`approved` are accepted aliases.

Pass `fields` to select returned property values. The value may be a
comma-separated string or a string array.

Accepted `fields` values:

- Identity: `id`, `slug`
- Copy: `title`, `description`
- Pricing: `price` (`currency`, `basis`, `amount`), `pricing` (display and negotiation metadata)
- Location: `location`, `structuredLocation`
- Classification: `purpose`, `category`, `types`
- Media and content: `images`, `amenities`, `documents`
- Listing accounts: `agency`, `listingAgent`, `isOwnerListing`
- Flags and status: `isFeatured`, `isApproved`, `status`
- Dates: `createdAt`, `updatedAt`
- Simple measurements: `area`, `areaUnit`, `facing`, `roadAccess`, `buildStart`,
  `buildCompleted`
- Spacing: `listings.spacing`, `spacing`
- Property details: `listings.details`, `details`

Request `listings.spacing` to return one `spacing` object with `bedrooms`,
`bathrooms`, `floors`, `onFloor`, `kitchens`, `diningRooms`, `livingRooms`,
`carParkingSpots`, and `bikeParkingSpots`.

Request `listings.details` when the caller does not know the property type. It
returns one `details` object with the available type-specific details:
`landDetails`, `plots`, `apartmentDetails`, `apartmentUnits`, `details`,
`roadAccessDetails`, `distancing`, `earnings`, `specifics.rooms`, and
`specifics.space`. `specifics.space` only includes the general area values
`area` and `areaUnit`.

Dot paths return nested JSON objects. The `listings.` prefix is accepted for
field paths and is removed from the returned property object.

::public end

::end
*/

import { getBaseUrl } from '@neup/logica/baseurl';
import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import type { EstateListingRecord } from '@neup/logica/estate/types';

// External packages required by this logic module.
const requiredPackages = [] as const;


const ListingsPath = 'bridge/api.v1/listings';

const DEFAULT_LIMIT = 15;
const DEFAULT_OFFSET = 0;
const MAX_LIMIT = 100;

export type EstateListingListInput = {
  agencyId?: string | null;
  accountId?: string | null;
  filter?: EstateListingListFilter | null;
  fields?: string[] | string | null;
  limit?: number | null;
  offset?: number | null;
};

export type EstateListingListFilter = {
  status?: string[] | string;
  id?: string;
  ids?: string[];
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  purpose?: string[] | string;
  category?: string[] | string;
  type?: string[] | string;
  minArea?: number;
  maxArea?: number;
  agencyName?: string;
  listingAgent?: string;
  isOwnerListing?: boolean;
  postedAfter?: string;
  postedBefore?: string;
  minFloors?: number;
  maxFloors?: number;
  minRoadAccess?: number;
  maxRoadAccess?: number;
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  diningRooms?: number;
  livingRooms?: number;
  carParkingSpots?: number;
  bikeParkingSpots?: number;
  listingBy?: string[] | string;
  tags?: string[] | string;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minKitchens?: number;
  maxKitchens?: number;
  minDiningRooms?: number;
  maxDiningRooms?: number;
  minLivingRooms?: number;
  maxLivingRooms?: number;
  minCarParkingSpots?: number;
  maxCarParkingSpots?: number;
  minBikeParkingSpots?: number;
  maxBikeParkingSpots?: number;
};

export type EstateListingListResponseBody = {
  success: boolean;
  limit: number;
  offset: number;
  listings: EstateListingRecord[];
  totalCount?: number;
  appliedFilters?: Record<string, unknown>;
  error?: string;
};

function serializeFields(fields: EstateListingListInput['fields']): string | undefined {
  if (!fields) return undefined;
  if (Array.isArray(fields)) return fields.map((field) => field.trim()).filter(Boolean).join(',');
  return fields.trim() || undefined;
}

// Serialize list filters as collection endpoint query parameters.
function serializeFilter(filter: EstateListingListFilter | null | undefined): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};
  if (!filter) return query;
  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined || value === null) continue;
    query[key] = Array.isArray(value) ? value.map(String).join(',') : value;
  }
  return query;
}

function normalizeLimit(limit: EstateListingListInput['limit']): number {
  if (!Number.isInteger(limit) || !limit || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

function normalizeOffset(offset: EstateListingListInput['offset']): number {
  if (!Number.isInteger(offset) || offset === null || offset === undefined || offset < 0) {
    return DEFAULT_OFFSET;
  }
  return offset;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || 'Failed to fetch listings.');
}

export async function listEstateListings(
  input: EstateListingListInput,
): Promise<ApiResponse<EstateListingListResponseBody>> {
  const limit = normalizeLimit(input.limit);
  const offset = normalizeOffset(input.offset);
  const query = {
    agency: input.agencyId,
    agent: input.accountId,
    fields: serializeFields(input.fields),
    limit,
    offset,
    ...serializeFilter(input.filter),
  };

  try {
    const result = await runApi<EstateListingListResponseBody>({
      baseUrl: getBaseUrl('estate'),
      path: ListingsPath,
      query,
    });
    const body = result.body;

    if (!body) {
      return {
        ok: false,
        status: result.status,
        body: {
          success: false,
          limit,
          offset,
          listings: [],
          error: 'Invalid listing list response.',
        },
        headers: result.headers,
      };
    }

    return {
      ok: result.ok,
      status: result.status,
      body,
      headers: result.headers,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      body: {
        success: false,
        limit,
        offset,
        listings: [],
        error: getErrorMessage(error),
      },
      headers: new Headers(),
    };
  }
}

