/*
::neup.documentation::logica-estate-listing-view
::title Logica Estate Listing View Helper

Portable SDK helper for `GET /bridge/api.v1/listings/[id]`.

::public

Fetches one approved listing's public API payload by its listing ID.

Pass `include` as a comma-separated string or string array to select property
fields and representatives. For example:
`listings.get('representatives.*')` sends
`GET /bridge/api.v1/listings/[id]?include=representatives.*` and returns all
representatives in one array: the listing owner, agents, agency, and property
owners. Select one group with `representatives.listingOwner`,
`representatives.agents`, `representatives.agent`, `representatives.agency`, or
`representatives.owners`. The `agents` selection includes supporting agents
and includes the listing owner when that account is an agent. The singular
`agent` selection returns only the listing owner when that account is an agent.
Entries include `id`, `type`, and available `name` and `image` values; agent
entries also have a `role`. For example:
`{"success":true,"listing":{"id":"listing-id","representatives":[{"id":"account-id","type":"agent","role":"listingOwner","name":"Agent Name","image":"https://example.com/agent.jpg"},{"id":"supporting-account-id","type":"agent","role":"supportingAgent","name":"Supporting Agent","image":"https://example.com/supporting-agent.jpg"},{"id":"agency-id","type":"agency","name":"Agency Name","image":"https://example.com/logo.jpg"},{"id":"owner-id","type":"owner","name":"Property Owner","isPrimaryOwner":true}]}}`.

The legacy `fields` input remains accepted as an alias for `include`.

Accepted scalar `include` values:

- Identity: `id`, `customId`, `slug`
- Copy and discovery: `title`, `description`, `keywords`, `tags`
- Classification: `purpose`, `category`, `type`, `status`, `visibility`
- Media: `images`, `images.id`, `images.url`, `images.type`,
  `images.isCover`, `images.order`
- Representatives: `representatives.*`, `representatives.listingOwner`,
  `representatives.agents`, `representatives.agent`,
  `representatives.agency`, `representatives.owners`
- Location: `location`, `location.id`, `location.text`, `location.geo`,
  `location.structured`
- Pricing: `pricing`, `pricing.type`, `pricing.askingAmount`,
  `pricing.currency`, `pricing.basis`, `pricing.unit`
- Road access: `roadAccess`, `roadAccess.roadWidth`,
  `roadAccess.roadWidthUnit`, `roadAccess.roadType`
- Distance: `distance`
- Amenities: `amenities`
- Property details: `listings.details`, `details`

Request `listings.details` when the caller does not know the property type. It
returns one `details` object with the available type-specific groups: `house`,
`apartment`, `land`, `flat`, and `space`.

Dot paths return nested JSON objects. The `listings.` prefix is accepted for
field paths and is removed from the returned property object.

::public end

::end
*/

import { getBaseUrl } from '@neup/logica/baseurl';
import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';

// External packages required by this logic module.
const requiredPackages = [] as const;


const LISTINGS_PATH = 'bridge/api.v1/listings';

export type ViewEstateListingInput = {
  propertyId: string;
  include?: string[] | string | null;
  /** @deprecated Use include. */
  fields?: string[] | string | null;
};

export type ViewEstateListingResponseBody = {
  success: boolean;
  listing?: EstateListingView;
  error?: string;
};

export type EstateListingRepresentative = {
  id: string;
  type: 'listingOwner' | 'agent' | 'agency' | 'owner';
  role?: 'listingOwner' | 'supportingAgent';
  name?: string | null;
  image?: string | null;
  isPrimaryOwner?: boolean;
};

export type EstateListingView = Record<string, unknown> & {
  id?: string;
  representatives: EstateListingRepresentative[];
};

function serializeFields(fields: ViewEstateListingInput['fields']): string | undefined {
  if (!fields) return undefined;
  if (Array.isArray(fields)) return fields.map((field) => field.trim()).filter(Boolean).join(',');
  return fields.trim() || undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || 'Failed to fetch listings.');
}

export async function viewEstateListing(
  input: ViewEstateListingInput,
): Promise<ApiResponse<ViewEstateListingResponseBody>> {
  const include = serializeFields(input.include ?? input.fields);

  try {
    const response = await runApi<ViewEstateListingResponseBody>({
      baseUrl: getBaseUrl('estate'),
      path: `${LISTINGS_PATH}/${encodeURIComponent(input.propertyId)}`,
      query: { include },
    });
    const body = response.body;

    if (!body) {
      return {
        ok: false,
        status: response.status,
        body: { success: false, error: 'Invalid property response.' },
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
      body: { success: false, error: getErrorMessage(error) },
      headers: new Headers(),
    };
  }
}
