/*
::neup.documentation::logica-estate-property-account-collections
::title Logica Estate Account Property Collections

Read account-scoped listing collections with offset pagination.

::public

Use `logica.estate.listings.getListingsListed(accountId, offset, limit)`,
`getListingsSaved`, `getListingsOwned`, `getListingsBeingWorked`, or
`getListingsByAccount` for account listing collections. The account must
match the authenticated account unless the caller has account-view permission.

::public end
::end
*/
import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { EstateListingRecord } from '@neup/logica/estate/types';

// External packages required by this logic module.
const requiredPackages = [] as const;



// Build a relative listings collection path so the configured estate base URL is retained.
const getAccountListingCollectionPath = (accountId: string, collection: Collection) =>
  `bridge/api.v1/listings/account/${encodeURIComponent(accountId)}/${collection}`;
export type EstateAccountListingListResponseBody = {
  success: boolean;
  listings: EstateListingRecord[];
  pagination?: { offset: number; limit: number };
  error?: string;
};

type Collection = 'by-account' | 'listed' | 'saved' | 'owned' | 'being-worked';

function normalizePage(offset = 0, limit = 20) {
  return {
    offset: Number.isSafeInteger(offset) && offset >= 0 ? offset : 0,
    limit: Number.isSafeInteger(limit) && limit > 0 ? Math.min(limit, 100) : 20,
  };
}

function getProperties(
  accountId: string,
  collection: Collection,
  offset = 0,
  limit = 20,
): Promise<ApiResponse<EstateAccountListingListResponseBody>> {
  const page = normalizePage(offset, limit);
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: getAccountListingCollectionPath(accountId, collection),
    query: page,
  });
}

export function getListingsByAccount(accountId: string, offset = 0, limit = 20) {
  return getProperties(accountId, 'by-account', offset, limit);
}

export function getListingsListed(accountId: string, offset = 0, limit = 20) {
  return getProperties(accountId, 'listed', offset, limit);
}

export function getListingsSaved(accountId: string, offset = 0, limit = 20) {
  return getProperties(accountId, 'saved', offset, limit);
}

export function getListingsOwned(accountId: string, offset = 0, limit = 20) {
  return getProperties(accountId, 'owned', offset, limit);
}

export function getListingsBeingWorked(accountId: string, offset = 0, limit = 20) {
  return getProperties(accountId, 'being-worked', offset, limit);
}
