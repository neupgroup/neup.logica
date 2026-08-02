/*
::neup.documentation::logica-estate-property-object
::title Logica Estate Property Object

Callable property object for the estate SDK.

::public

Use `logica.estate.property.create(data)` and
`logica.estate.property.search(filters)` for collection operations.

Use `logica.estate.property(propertyId).*` for one property's scoped operations.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@/logica/estate/api';
import { createEstateProperty, type CreateEstatePropertyResponseBody } from '@/logica/estate/property/create';
import { modifyEstateProperty, type ModifyEstatePropertyResponseBody } from '@/logica/estate/property/modify';
import { searchEstateProperties, type SearchEstatePropertiesInput, type SearchEstatePropertiesResponseBody } from '@/logica/estate/property/search';
import { viewEstateProperty, type ViewEstatePropertyResponseBody } from '@/logica/estate/property/view';
import type { EstateObjectRecord, EstatePropertyCreateData } from '@/logica/estate/types';

type Fields = string[] | string | null;

function serializeFields(fields: Fields | undefined): string | undefined {
  if (!fields) return undefined;
  if (Array.isArray(fields)) return fields.map((field) => field.trim()).filter(Boolean).join(',');
  return fields.trim() || undefined;
}

function requestScopedList(kind: 'reaction' | 'save' | 'comment' | 'inquiry', propertyId: string) {
  return requestEstateApi({
    path: `/bridge/api.v1/${kind}/list`,
    query: { propertyId },
  });
}

function createCollectionScope(kind: 'reaction' | 'save' | 'comment', propertyId: string) {
  return {
    add(data: EstateObjectRecord = {}): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: `/bridge/api.v1/${kind}/add`,
        method: 'POST',
        body: { propertyId, ...data },
      });
    },

    remove(id?: string): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: `/bridge/api.v1/${kind}/remove`,
        method: 'POST',
        body: { propertyId, id },
      });
    },

    list(): Promise<EstateApiResponse> {
      return requestScopedList(kind, propertyId);
    },
  } as const;
}

function createInquiryScope(propertyId: string) {
  function create(data: EstateObjectRecord = {}): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/inquiry',
      method: 'POST',
      query: { property: propertyId },
      body: { propertyId, ...data },
    });
  }

  return {
    add: create,
    create,
    list(): Promise<EstateApiResponse> {
      return requestScopedList('inquiry', propertyId);
    },
  } as const;
}

function createOfferScope(propertyId: string) {
  const offer = function offer(offerJson: EstateObjectRecord = {}) {
    return {
      create(): Promise<EstateApiResponse> {
        return requestEstateApi({
          path: '/bridge/api.v1/offer/create',
          method: 'POST',
          body: { propertyId, ...offerJson },
        });
      },
    } as const;
  };

  offer.get = function get(): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/offer/list',
      query: { propertyId },
    });
  };

  offer.list = offer.get;

  return offer;
}

function getPropertyByCode(propertyCode: string, fields?: Fields) {
  return requestEstateApi<ViewEstatePropertyResponseBody>({
    path: '/bridge/api.v1/property/view',
    query: {
      propertyCode,
      fields: serializeFields(fields),
    },
  });
}

export function property(propertyId: string) {
  return {
    get(fields?: Fields): Promise<EstateApiResponse<ViewEstatePropertyResponseBody>> {
      return viewEstateProperty({ propertyId, fields });
    },

    update(data: EstateObjectRecord): Promise<EstateApiResponse<ModifyEstatePropertyResponseBody>> {
      return modifyEstateProperty({ propertyId, property: data });
    },

    publish(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/property/publish',
        method: 'POST',
        body: { propertyId },
      });
    },

    archive(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/property/archive',
        method: 'POST',
        body: { propertyId },
      });
    },

    reaction: createCollectionScope('reaction', propertyId),
    save: createCollectionScope('save', propertyId),
    comment: createCollectionScope('comment', propertyId),
    inquiry: createInquiryScope(propertyId),
    offer: createOfferScope(propertyId),
  } as const;
}

property.create = function create(data: EstatePropertyCreateData): Promise<EstateApiResponse<CreateEstatePropertyResponseBody>> {
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

property.search = function search(
  filters: SearchEstatePropertiesInput = {},
): Promise<EstateApiResponse<SearchEstatePropertiesResponseBody>> {
  return searchEstateProperties(filters);
};

property.getById = function getById(propertyId: string, fields?: Fields) {
  return property(propertyId).get(fields);
};

property.getByCode = function getByCode(propertyCode: string, fields?: Fields) {
  return getPropertyByCode(propertyCode, fields);
};

property.code = function code(propertyCode: string) {
  return {
    get(fields?: Fields): Promise<EstateApiResponse<ViewEstatePropertyResponseBody>> {
      return getPropertyByCode(propertyCode, fields);
    },
  } as const;
};

property.update = function update(propertyId: string, data: EstateObjectRecord) {
  return property(propertyId).update(data);
};

property.publish = function publish(propertyId: string) {
  return property(propertyId).publish();
};

property.archive = function archive(propertyId: string) {
  return property(propertyId).archive();
};

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

export type EstatePropertyScope = ReturnType<typeof property>;

export default property;
