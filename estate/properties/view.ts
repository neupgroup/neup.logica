/*
::neup.documentation::logica-estate-properties-view
::title Logica Estate Property View Helper

Portable SDK helper for `GET /bridge/api.v1/property/view`.

::public

Fetches one approved property's public bridge payload by `propertyId`.

Pass `fields` to limit the returned `property` object to selected values. The
value may be a comma-separated string or a string array.

Accepted `fields` values:

- Identity: `id`, `customId`, `slug`
- Copy and discovery: `title`, `description`, `keywords`, `tags`
- Classification: `purpose`, `category`, `type`, `status`, `visibility`
- Media: `images`, `images.id`, `images.url`, `images.type`,
  `images.isCover`, `images.order`
- Listing accounts: `listedBy`, `listedBy.type`, `listedBy.id`,
  `listedBy.displayName`, `listedBy.displayImage`, `supportingAgents`
- Location: `location`, `location.id`, `location.text`, `location.geo`,
  `location.structured`
- Pricing: `pricing`, `pricing.type`, `pricing.askingAmount`,
  `pricing.currency`, `pricing.basis`, `pricing.unit`
- Road access: `roadAccess`, `roadAccess.roadWidth`,
  `roadAccess.roadWidthUnit`, `roadAccess.roadType`
- Distance: `distance`
- Amenities: `amenities`
- Property details: `property.details`, `details`

Request `property.details` when the caller does not know the property type. It
returns one `details` object with the available type-specific groups: `house`,
`apartment`, `land`, `flat`, and `space`.

Dot paths return nested JSON objects. The `property.` prefix is accepted for
field paths and is removed from the returned property object.

::public end

::end
*/

import baseJson from '@/logica/estate/base.json';
import type { NeupBridgeResponse } from '@/logica/core/api-runner';

export type ViewEstatePropertyInput = {
  propertyId: string;
  fields?: string[] | string | null;
};

export type ViewEstatePropertyResponseBody = {
  success: boolean;
  property?: unknown;
  error?: string;
};

function serializeFields(fields: ViewEstatePropertyInput['fields']): string | undefined {
  if (!fields) return undefined;
  if (Array.isArray(fields)) return fields.map((field) => field.trim()).filter(Boolean).join(',');
  return fields.trim() || undefined;
}

export async function viewEstateProperty(
  input: ViewEstatePropertyInput,
): Promise<NeupBridgeResponse<ViewEstatePropertyResponseBody>> {
  const url = new URL('/bridge/api.v1/property/view', baseJson.baseEndpoint);
  url.searchParams.set('propertyId', input.propertyId);
  const fields = serializeFields(input.fields);
  if (fields) url.searchParams.set('fields', fields);

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
