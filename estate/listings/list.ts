/*
::neup.documentation::logica-estate-property-list
::title Logica Estate Property List Helper

Portable SDK helper for `GET /bridge/api.v1/listings`.

::public

Fetches listing payloads with optional agency or account filtering. Without
`status`, the endpoint returns only active listings. Supply a comma-separated
value (or string array) to request other statuses, for example:
`listings.list({ accountId: 'account-id', status: ['drafts', 'pending'] })`
sends `GET /bridge/api.v1/listings?agent=account-id&status=drafts,pending`.
`listings.list({ accountId: 'account-id', status: 'rejected' })` requests only
rejected properties.
The response retains each listing's own `status`, for example
`{"success":true,"listings":[{"id":"listing-id","status":"PENDING"}],"totalCount":1,"limit":15,"offset":0}`.

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
- Pricing: `price`, `pricing`
- Location: `location`, `structuredLocation`
- Classification: `purpose`, `purposes`, `category`, `type`
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

// External packages required by this logic module.
const requiredPackages = [] as const;


const ListingsPath = 'bridge/api.v1/listings';

const DEFAULT_LIMIT = 15;
const DEFAULT_OFFSET = 0;
const MAX_LIMIT = 100;

export type EstateListingListInput = {
  agencyId?: string | null;
  accountId?: string | null;
  status?: string[] | string | null;
  fields?: string[] | string | null;
  limit?: number | null;
  offset?: number | null;
};

export type EstateListingListResponseBody = {
  success: boolean;
  limit: number;
  offset: number;
  listings: unknown[];
  totalCount?: number;
  appliedFilters?: Record<string, unknown>;
  error?: string;
};

function serializeFields(fields: EstateListingListInput['fields']): string | undefined {
  if (!fields) return undefined;
  if (Array.isArray(fields)) return fields.map((field) => field.trim()).filter(Boolean).join(',');
  return fields.trim() || undefined;
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
    status: serializeFields(input.status),
    fields: serializeFields(input.fields),
    limit,
    offset,
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
