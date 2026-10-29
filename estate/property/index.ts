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

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import { createEstateProperty, type CreateEstatePropertyResponseBody } from '@neup/logica/estate/property/create';
import { modifyEstateProperty, type ModifyEstatePropertyResponseBody } from '@neup/logica/estate/property/modify';
import { searchEstateProperties, type SearchEstatePropertiesInput, type SearchEstatePropertiesResponseBody } from '@neup/logica/estate/property/search';
import { listEstateProperties, type EstatePropertyListInput, type EstatePropertyListResponseBody } from '@neup/logica/estate/property/list';
import {
  getPropertiesBeingWorked,
  getPropertiesByAccount,
  getPropertiesListed,
  getPropertiesOwned,
  getPropertiesSaved,
  type EstateAccountPropertyListResponseBody,
} from '@neup/logica/estate/property/account';
import {
  viewEstateProperty,
  type EstatePropertyRepresentative,
  type EstatePropertyView,
  type ViewEstatePropertyResponseBody,
} from '@neup/logica/estate/property/view';
import {
  savedProperties,
  type EstateSavedPropertiesListOptions,
  type EstateSavedPropertyRemoval,
} from '@neup/logica/estate/property/saved';
import type { EstateObjectRecord, EstatePropertyCreateData } from '@neup/logica/estate/types';


/** Builds the API endpoint for propertycollectionlist. */
const getPropertyCollectionListEndpoint = (kind: string) => `https://neupgroup.com/estate/bridge/api.v1/${kind}/list`;
/** Builds the API endpoint for propertycollectionadd. */
const getPropertyCollectionAddEndpoint = (kind: string) => `https://neupgroup.com/estate/bridge/api.v1/${kind}/add`;
/** Builds the API endpoint for propertycollectionremove. */
const getPropertyCollectionRemoveEndpoint = (kind: string) => `https://neupgroup.com/estate/bridge/api.v1/${kind}/remove`;
/** Builds the API endpoint for property. */
const getPropertyEndpoint = (propertyCode: string) => `https://neupgroup.com/estate/bridge/api.v1/properties/${encodeURIComponent(propertyCode)}`;
const InquiryEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/inquiry';
const OfferCreateEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/offer/create';
const OfferListEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/offer/list';
const PropertyPublishEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/property/publish';
const PropertyArchiveEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/property/archive';
const PropertiesEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/properties';

type Fields = string[] | string | null;

function serializeFields(fields: Fields | undefined): string | undefined {
  if (!fields) return undefined;
  if (Array.isArray(fields)) return fields.map((field) => field.trim()).filter(Boolean).join(',');
  return fields.trim() || undefined;
}

function requestScopedList(kind: 'save' | 'comment' | 'inquiry', propertyId: string) {
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: getPropertyCollectionListEndpoint(kind),
    query: { propertyId },
  });
}

function createCollectionScope(kind: 'save' | 'comment', propertyId: string) {
  return {
    add(data: EstateObjectRecord = {}): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: getPropertyCollectionAddEndpoint(kind),
        method: 'POST',
        body: { propertyId, ...data },
      });
    },

    remove(id?: string): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: getPropertyCollectionRemoveEndpoint(kind),
        method: 'POST',
        body: { propertyId, id },
      });
    },

    list(): Promise<ApiResponse> {
      return requestScopedList(kind, propertyId);
    },
  } as const;
}

function createInquiryScope(propertyId: string) {
  function create(data: EstateObjectRecord = {}): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: InquiryEndpoint,
      method: 'POST',
      query: { property: propertyId },
      body: { propertyId, ...data },
    });
  }

  return {
    add: create,
    create,
    list(): Promise<ApiResponse> {
      return requestScopedList('inquiry', propertyId);
    },
  } as const;
}

function createOfferScope(propertyId: string) {
  const offer = function offer(offerJson: EstateObjectRecord = {}) {
    return {
      create(): Promise<ApiResponse> {
        return runApi({
          baseUrl: getBaseUrl('estate'),
          path: OfferCreateEndpoint,
          method: 'POST',
          body: { propertyId, ...offerJson },
        });
      },
    } as const;
  };

  offer.get = function get(): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: OfferListEndpoint,
      query: { propertyId },
    });
  };

  offer.list = offer.get;

  return offer;
}

function getPropertyByCode(propertyCode: string, include?: Fields) {
  return runApi<ViewEstatePropertyResponseBody>({
    baseUrl: getBaseUrl('estate'),
    path: getPropertyEndpoint(propertyCode),
    query: {
      propertyCode,
      include: serializeFields(include),
    },
  });
}

export function property(propertyId: string) {
  return {
    get(include?: Fields): Promise<ApiResponse<ViewEstatePropertyResponseBody>> {
      return viewEstateProperty({ propertyId, include });
    },

    update(data: EstateObjectRecord): Promise<ApiResponse<ModifyEstatePropertyResponseBody>> {
      return modifyEstateProperty({ propertyId, property: data });
    },

    publish(): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: PropertyPublishEndpoint,
        method: 'POST',
        body: { propertyId },
      });
    },

    archive(): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: PropertyArchiveEndpoint,
        method: 'POST',
        body: { propertyId },
      });
    },

    save: createCollectionScope('save', propertyId),
    comment: createCollectionScope('comment', propertyId),
    inquiry: createInquiryScope(propertyId),
    offer: createOfferScope(propertyId),
  } as const;
}

property.create = function create(data: EstatePropertyCreateData): Promise<ApiResponse<CreateEstatePropertyResponseBody>> {
  if (data.property && typeof data.accountId === 'string') {
    return createEstateProperty({
      accountId: data.accountId,
      property: data.property,
      postingAgencyId: typeof data.postingAgencyId === 'string' ? data.postingAgencyId : null,
      workingProfileId: typeof data.workingProfileId === 'string' ? data.workingProfileId : null,
    });
  }

  return runApi<CreateEstatePropertyResponseBody>({
    baseUrl: getBaseUrl('estate'),
    path: PropertiesEndpoint,
    method: 'POST',
    body: data,
  });
};

property.search = function search(
  filters: SearchEstatePropertiesInput = {},
): Promise<ApiResponse<SearchEstatePropertiesResponseBody>> {
  return searchEstateProperties(filters);
};

property.list = function list(
  input: EstatePropertyListInput,
): Promise<ApiResponse<EstatePropertyListResponseBody>> {
  return listEstateProperties(input);
};

property.getPropertiesByAccount = getPropertiesByAccount;
property.getPropertiesListed = getPropertiesListed;
property.getPropertiesSaved = getPropertiesSaved;
property.getPropertiesOwned = getPropertiesOwned;
property.getPropertiesBeingWorked = getPropertiesBeingWorked;

property.getById = function getById(propertyId: string, include?: Fields) {
  return property(propertyId).get(include);
};

property.getByCode = function getByCode(propertyCode: string, include?: Fields) {
  return getPropertyByCode(propertyCode, include);
};

property.code = function code(propertyCode: string) {
  return {
    get(include?: Fields): Promise<ApiResponse<ViewEstatePropertyResponseBody>> {
      return getPropertyByCode(propertyCode, include);
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

export namespace property {
  export const saved = savedProperties;
}

export {
  createEstateProperty,
  modifyEstateProperty,
  searchEstateProperties,
  listEstateProperties,
  getPropertiesByAccount,
  getPropertiesListed,
  getPropertiesSaved,
  getPropertiesOwned,
  getPropertiesBeingWorked,
  viewEstateProperty,
};

export type {
  CreateEstatePropertyResponseBody,
  EstatePropertyCreateData,
  ModifyEstatePropertyResponseBody,
  SearchEstatePropertiesInput,
  SearchEstatePropertiesResponseBody,
  EstatePropertyListInput,
  EstatePropertyListResponseBody,
  EstateAccountPropertyListResponseBody,
  EstatePropertyRepresentative,
  EstatePropertyView,
  ViewEstatePropertyResponseBody,
  EstateSavedPropertiesListOptions,
  EstateSavedPropertyRemoval,
};

export type EstatePropertyScope = ReturnType<typeof property>;

export default property;
