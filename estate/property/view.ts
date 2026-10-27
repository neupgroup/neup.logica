/*
::neup.documentation::logica-estate-property-view
::title Logica Estate Property View Helper

Portable SDK helper for `GET /bridge/api.v1/properties/[id]`.

::public

Fetches one approved property's public API payload by `propertyId`.

Pass `include` as a comma-separated string or string array to select property
fields and nested agent/agency fields. For example:
`property.get('agent(id,name,image),agency(name,image)')` sends
`GET /bridge/api.v1/properties/[id]?include=agent(id,name,image),agency(name,image)`.
Use `supportingAgents(name,image)` to request the same fields for supporting
agents. Agent, supporting agent, and agency objects always include `id`; a bare
relationship selects only its default `id`, while `agent(*)` or
`supportingAgents(*)` selects all documented agent fields. The same rules apply
to agency. For agent selections, `displayName` aliases `name` and
`displayImage` aliases `image`; responses use `name` and `image`. A response example is:
`{"success":true,"property":{"id":"property-id","agent":[{"id":"account-id","name":"Agent Name","image":"https://example.com/agent.jpg"}],"supportingAgents":[{"id":"supporting-account-id","name":"Supporting Agent","image":"https://example.com/supporting-agent.jpg"}],"agency":{"id":"agency-id","name":"Agency Name","image":"https://example.com/logo.jpg"}}}`.

The legacy `fields` input remains accepted as an alias for `include`.

Accepted scalar `include` values:

- Identity: `id`, `customId`, `slug`
- Copy and discovery: `title`, `description`, `keywords`, `tags`
- Classification: `purpose`, `category`, `type`, `status`, `visibility`
- Media: `images`, `images.id`, `images.url`, `images.type`,
  `images.isCover`, `images.order`
- Listing accounts: `agent`, `agent(id,name,image)`, `agent(*)`,
  `supportingAgents`, `supportingAgents(id,name,image)`, `supportingAgents(*)`,
  `agency`, `agency(id,name,image)`, `agency(*)`
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

import { getBaseUrl } from '@neup/logica/baseurl';
import { url } from '@neup/core/helpers/url';
import type { EstateApiResponse } from '@neup/logica/estate/api';

export type ViewEstatePropertyInput = {
  propertyId: string;
  include?: string[] | string | null;
  /** @deprecated Use include. */
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

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || 'Failed to fetch property.');
}

export async function viewEstateProperty(
  input: ViewEstatePropertyInput,
): Promise<EstateApiResponse<ViewEstatePropertyResponseBody>> {
  const requestUrl = url.web.path(getBaseUrl('estate'))
    .addPath(`/bridge/api.v1/properties/${encodeURIComponent(input.propertyId)}`)
    .addParam('propertyId', input.propertyId);
  const include = serializeFields(input.include ?? input.fields);
  if (include) requestUrl.addParam('include', include);

  try {
    const response = await fetch(requestUrl.get(), {
      method: 'GET',
      cache: 'no-store',
    });

    const body = (await response.json().catch(() => null)) as ViewEstatePropertyResponseBody | null;

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
