/*
::neup.documentation::logica-estate-property-object
::title Logica Estate Property Object

Property methods for the nested estate object API.

::public

Use `logica.estate.property(propertyId).*` for one property and
`logica.estate.property.*` for collection-level property helpers.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@/logica/estate/api';
import { createEstateProperty, type CreateEstatePropertyResponseBody } from '@/logica/estate/property/create';
import { modifyEstateProperty, type ModifyEstatePropertyResponseBody } from '@/logica/estate/property/modify';
import { searchEstateProperties, type SearchEstatePropertiesInput, type SearchEstatePropertiesResponseBody } from '@/logica/estate/property/search';
import { viewEstateProperty, type ViewEstatePropertyResponseBody } from '@/logica/estate/property/view';
import type { EstateObjectRecord, EstatePropertyCreateData } from '@/logica/estate/types';

type PropertyFields = string[] | string | null;

function serializeFields(fields: PropertyFields | undefined): string | undefined {
  if (!fields) return undefined;
  if (Array.isArray(fields)) return fields.map((field) => field.trim()).filter(Boolean).join(',');
  return fields.trim() || undefined;
}

function getPropertyByCode(
  propertyCode: string,
  fields?: PropertyFields,
): Promise<EstateApiResponse<ViewEstatePropertyResponseBody>> {
  return requestEstateApi<ViewEstatePropertyResponseBody>({
    path: '/bridge/api.v1/property/view',
    query: {
      propertyCode,
      fields: serializeFields(fields),
    },
  });
}

function updateProperty(
  propertyId: string,
  data: EstateObjectRecord,
): Promise<EstateApiResponse<ModifyEstatePropertyResponseBody>> {
  return modifyEstateProperty({ propertyId, property: data });
}

function publishProperty(propertyId: string): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/property/publish',
    method: 'POST',
    body: { propertyId },
  });
}

function archiveProperty(propertyId: string): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/property/archive',
    method: 'POST',
    body: { propertyId },
  });
}

export function property(propertyId: string) {
  return {
    get(fields?: PropertyFields): Promise<EstateApiResponse<ViewEstatePropertyResponseBody>> {
      return viewEstateProperty({ propertyId, fields });
    },

    update(data: EstateObjectRecord): Promise<EstateApiResponse<ModifyEstatePropertyResponseBody>> {
      return updateProperty(propertyId, data);
    },

    publish(): Promise<EstateApiResponse> {
      return publishProperty(propertyId);
    },

    archive(): Promise<EstateApiResponse> {
      return archiveProperty(propertyId);
    },
  } as const;
}

property.getById = function getById(
  propertyId: string,
  fields?: PropertyFields,
): Promise<EstateApiResponse<ViewEstatePropertyResponseBody>> {
  return property(propertyId).get(fields);
};

property.getByCode = function getByCode(
  propertyCode: string,
  fields?: PropertyFields,
): Promise<EstateApiResponse<ViewEstatePropertyResponseBody>> {
  return getPropertyByCode(propertyCode, fields);
};

property.code = function code(propertyCode: string) {
  return {
    get(fields?: PropertyFields): Promise<EstateApiResponse<ViewEstatePropertyResponseBody>> {
      return getPropertyByCode(propertyCode, fields);
    },
  } as const;
};

property.search = function search(
  filters: SearchEstatePropertiesInput = {},
): Promise<EstateApiResponse<SearchEstatePropertiesResponseBody>> {
  return searchEstateProperties(filters);
};

property.create = function create(
  data: EstatePropertyCreateData,
): Promise<EstateApiResponse<CreateEstatePropertyResponseBody>> {
  if (data.property && typeof data.accountId === 'string') {
    return createEstateProperty({
      accountId: data.accountId,
      property: data.property,
      postingAgencyId: typeof data.postingAgencyId === 'string' ? data.postingAgencyId : null,
      workingProfileId: typeof data.workingProfileId === 'string' ? data.workingProfileId : null,
    });
  }

  return requestEstateApi<CreateEstatePropertyResponseBody>({
    path: '/bridge/api.v1/property/create',
    method: 'POST',
    body: data,
  });
};

property.update = function update(
  propertyId: string,
  data: EstateObjectRecord,
): Promise<EstateApiResponse<ModifyEstatePropertyResponseBody>> {
  return updateProperty(propertyId, data);
};

property.publish = function publish(propertyId: string): Promise<EstateApiResponse> {
  return publishProperty(propertyId);
};

property.archive = function archive(propertyId: string): Promise<EstateApiResponse> {
  return archiveProperty(propertyId);
};

property.scoped = function scoped(propertyId: string) {
  return property(propertyId);
};

property.collection = {
  search: property.search,
  create: property.create,
} as const;

export const propertyObject = property;

/*
 * Intentionally no `list()` exists on `property(propertyId)`.
 * Listing belongs to scoped collections such as `agency(id).property.list()`.
 */

/*
 * Backward-compatible collection methods stay attached to the callable
 * function while item actions move to `property(propertyId).*`.
 */

export type EstatePropertyScope = ReturnType<typeof property>;

export type EstatePropertyCodeScope = ReturnType<typeof property.code>;

export type EstatePropertyCollection = typeof property;

export const estateProperty = property;

/*
 * Deprecated aliases. Prefer `property(id).get()` and `property(id).update()`.
 */
export const propertyApi = {
  getById(propertyId: string): Promise<EstateApiResponse<ViewEstatePropertyResponseBody>> {
    return property.getById(propertyId);
  },

  getByCode(propertyCode: string): Promise<EstateApiResponse<ViewEstatePropertyResponseBody>> {
    return property.getByCode(propertyCode);
  },

  search(filters: SearchEstatePropertiesInput = {}): Promise<EstateApiResponse<SearchEstatePropertiesResponseBody>> {
    return property.search(filters);
  },

  create(data: EstatePropertyCreateData): Promise<EstateApiResponse<CreateEstatePropertyResponseBody>> {
    return property.create(data);
  },

  update(propertyId: string, data: EstateObjectRecord): Promise<EstateApiResponse<ModifyEstatePropertyResponseBody>> {
    return property.update(propertyId, data);
  },

  publish(propertyId: string): Promise<EstateApiResponse> {
    return property.publish(propertyId);
  },

  archive(propertyId: string): Promise<EstateApiResponse> {
    return property.archive(propertyId);
  },
} as const;

export {
  createEstateProperty,
  modifyEstateProperty,
  searchEstateProperties,
  viewEstateProperty,
};

export type {
  CreateEstatePropertyResponseBody,
  EstatePropertyCreateData,
  ModifyEstatePropertyResponseBody,
  SearchEstatePropertiesInput,
  SearchEstatePropertiesResponseBody,
  ViewEstatePropertyResponseBody,
};

export default property;
