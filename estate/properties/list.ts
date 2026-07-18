/*
::neup.documentation::logica-estate-properties-list
::title Logica Estate Property List Helper

Portable SDK helper for `GET /bridge/api.v1/property/list`.

::public

Fetches active bridge property payloads for exactly one agency or account.

Pagination defaults to `limit: 10` and `offset: 0` when omitted. The endpoint
returns at most 15 properties per request, so larger `limit` values are capped
to 15.

Pass `fields` to limit each returned property to selected values. The value may
be a comma-separated string or a string array.

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
- Spacing: `property.spacing`, `spacing`
- Property details: `property.details`, `details`

Request `property.spacing` to return one `spacing` object with `bedrooms`,
`bathrooms`, `floors`, `onFloor`, `kitchens`, `diningRooms`, `livingRooms`,
`carParkingSpots`, and `bikeParkingSpots`.

Request `property.details` when the caller does not know the property type. It
returns one `details` object with the available type-specific details:
`landDetails`, `plots`, `apartmentDetails`, `apartmentUnits`, `details`,
`roadAccessDetails`, `distancing`, `earnings`, `specifics.rooms`, and
`specifics.space`. `specifics.space` only includes the general area values
`area` and `areaUnit`.

Dot paths return nested JSON objects. The `property.` prefix is accepted for
field paths and is removed from the returned property object.

::public end

::end
*/

import baseJson from '@/logica/estate/base.json';
import type { NeupBridgeResponse } from '@/logica/core/api-runner';

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;
const MAX_LIMIT = 15;

export type EstatePropertyListInput = {
  agencyId?: string | null;
  accountId?: string | null;
  fields?: string[] | string | null;
  limit?: number | null;
  offset?: number | null;
};

export type EstatePropertyListResponseBody = {
  success: boolean;
  limit: number;
  offset: number;
  properties: unknown[];
  error?: string;
};

function serializeFields(fields: EstatePropertyListInput['fields']): string | undefined {
  if (!fields) return undefined;
  if (Array.isArray(fields)) return fields.map((field) => field.trim()).filter(Boolean).join(',');
  return fields.trim() || undefined;
}

function normalizeLimit(limit: EstatePropertyListInput['limit']): number {
  if (!Number.isInteger(limit) || !limit || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

function normalizeOffset(offset: EstatePropertyListInput['offset']): number {
  if (!Number.isInteger(offset) || offset === null || offset === undefined || offset < 0) {
    return DEFAULT_OFFSET;
  }
  return offset;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || 'Failed to fetch property list.');
}

export async function listEstateProperties(
  input: EstatePropertyListInput,
): Promise<NeupBridgeResponse<EstatePropertyListResponseBody>> {
  const url = new URL('/bridge/api.v1/property/list', baseJson.baseEndpoint);
  const limit = normalizeLimit(input.limit);
  const offset = normalizeOffset(input.offset);
  const query = {
    agency_id: input.agencyId,
    account_id: input.accountId,
    fields: serializeFields(input.fields),
    limit,
    offset,
  };

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') continue;
    url.searchParams.set(key, String(value));
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
    });

    const body = (await response.json().catch(() => null)) as EstatePropertyListResponseBody | null;

    if (!body) {
      return {
        ok: false,
        status: response.status,
        body: {
          success: false,
          limit,
          offset,
          properties: [],
          error: 'Invalid property list response.',
        },
        headers: response.headers,
      };
    }

    return {
      ok: response.ok,
      status: response.status,
      body,
      headers: response.headers,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      body: {
        success: false,
        limit,
        offset,
        properties: [],
        error: getErrorMessage(error),
      },
      headers: new Headers(),
    };
  }
}
