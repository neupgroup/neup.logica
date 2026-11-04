/*
::neup.documentation::logica-estate-listings-object
::title Logica Estate Listings Object

Callable listings object for the estate SDK.

::public

Use `logica.estate.listings.create(data)` and `logica.estate.listings.search(data)`
for collection operations. Use `logica.estate.listings(id).get()` or `.update(data)`
for one listing.

::public end
::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import { createEstateListing, type CreateEstateListingResponseBody } from '@neup/logica/estate/listings/create';
import { modifyEstateListing, type ModifyEstateListingResponseBody } from '@neup/logica/estate/listings/modify';
import { searchEstateListings, type EstateListingsSearchInput, type EstateListingsSearchResponseBody } from '@neup/logica/estate/listings/advanced-search';
import { listEstateListings, type EstateListingListInput, type EstateListingListResponseBody } from '@neup/logica/estate/listings/list';
import {
  getListingsBeingWorked,
  getListingsByAccount,
  getListingsListed,
  getListingsOwned,
  getListingsSaved,
  type EstateAccountListingListResponseBody,
} from '@neup/logica/estate/listings/account';
import {
  viewEstateListing,
  type EstateListingRepresentative,
  type EstateListingView,
  type ViewEstateListingResponseBody,
} from '@neup/logica/estate/listings/view';
import {
  savedListings,
  type EstateSavedListingsListOptions,
  type EstateSavedListingRemoval,
} from '@neup/logica/estate/listings/saved';
import type { EstateListingCreateData, EstateListingRecord } from '@neup/logica/estate/types';

const LISTINGS_PATH = 'bridge/api.v1/listings';
type Fields = string[] | string | null;

// Convert optional field selections to the API include query format.
function serializeFields(fields: Fields | undefined): string | undefined {
  if (!fields) return undefined;
  if (Array.isArray(fields)) return fields.map((field) => field.trim()).filter(Boolean).join(',');
  return fields.trim() || undefined;
}

// Fetch one listing by its path identifier or custom listing code.
function getListingByCode(listingCode: string, include?: Fields) {
  return runApi<ViewEstateListingResponseBody>({
    baseUrl: getBaseUrl('estate'),
    path: `${LISTINGS_PATH}/${encodeURIComponent(listingCode)}`,
    query: { propertyCode: listingCode, include: serializeFields(include) },
  });
}

// Create a listing scoped to its API path identifier.
export function listings(propertyId: string) {
  return {
    get(include?: Fields): Promise<ApiResponse<ViewEstateListingResponseBody>> {
      return viewEstateListing({ propertyId, include });
    },
    update(data: EstateListingRecord & { accountId?: string }): Promise<ApiResponse<ModifyEstateListingResponseBody>> {
      const { accountId, ...listing } = data;
      return modifyEstateListing({ listingId: propertyId, accountId, listing });
    },
  } as const;
}

// Submit a listing to the current collection creation endpoint.
listings.create = function create(data: EstateListingCreateData): Promise<ApiResponse<CreateEstateListingResponseBody>> {
  return createEstateListing(data);
};

// Search listings through the shared GET/POST search endpoint.
listings.search = function search(
  input: EstateListingsSearchInput = {},
): Promise<ApiResponse<EstateListingsSearchResponseBody>> {
  return searchEstateListings(input);
};

// List listings using the collection endpoint's supported query parameters.
listings.list = function list(
  input: EstateListingListInput,
): Promise<ApiResponse<EstateListingListResponseBody>> {
  return listEstateListings(input);
};

// Retrieve the listings for an account's supported collection.
listings.getListingsByAccount = getListingsByAccount;
listings.getListingsListed = getListingsListed;
listings.getListingsSaved = getListingsSaved;
listings.getListingsOwned = getListingsOwned;
listings.getListingsBeingWorked = getListingsBeingWorked;

// Retrieve a single listing by ID or custom code.
listings.getById = function getById(propertyId: string, include?: Fields) {
  return listings(propertyId).get(include);
};
listings.getByCode = function getByCode(listingCode: string, include?: Fields) {
  return getListingByCode(listingCode, include);
};
listings.code = function code(listingCode: string) {
  return { get: (include?: Fields) => getListingByCode(listingCode, include) } as const;
};

// Update a listing through its current PATCH endpoint.
listings.update = function update(propertyId: string, data: EstateListingRecord) {
  return listings(propertyId).update(data);
};

export namespace listings {
  export const saved = savedListings;
}

export {
  createEstateListing,
  modifyEstateListing,
  searchEstateListings,
  listEstateListings,
  getListingsByAccount,
  getListingsListed,
  getListingsSaved,
  getListingsOwned,
  getListingsBeingWorked,
  viewEstateListing,
};

export type {
  CreateEstateListingResponseBody,
  EstateListingCreateData,
  EstateListingRecord,
  ModifyEstateListingResponseBody,
  EstateListingsSearchInput,
  EstateListingsSearchResponseBody,
  EstateListingListInput,
  EstateListingListResponseBody,
  EstateAccountListingListResponseBody,
  EstateListingRepresentative,
  EstateListingView,
  ViewEstateListingResponseBody,
  EstateSavedListingsListOptions,
  EstateSavedListingRemoval,
};

export type EstateListingScope = ReturnType<typeof listings>;
export default listings;
