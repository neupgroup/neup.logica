/*
::neup.documentation::logica-estate-property-account-collections
::title Logica Estate Account Property Collections

Read account-scoped property collections with offset pagination.

::public

Use `logica.estate.property.getPropertiesListed(accountId, offset, limit)`,
`getPropertiesSaved`, `getPropertiesOwned`, `getPropertiesBeingWorked`, or
`getPropertiesByAccount` for account property collections. The account must
match the authenticated account unless the caller has account-view permission.

::public end
::end
*/
import { requestEstateApi, type EstateApiResponse } from '@neup/logica/estate/api';

export type EstateAccountPropertyListResponseBody = {
  success: boolean;
  properties: unknown[];
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
): Promise<EstateApiResponse<EstateAccountPropertyListResponseBody>> {
  const page = normalizePage(offset, limit);
  return requestEstateApi({
    path: `/bridge/api.v1/properties/account/${encodeURIComponent(accountId)}/${collection}`,
    query: page,
  });
}

export function getPropertiesByAccount(accountId: string, offset = 0, limit = 20) {
  return getProperties(accountId, 'by-account', offset, limit);
}

export function getPropertiesListed(accountId: string, offset = 0, limit = 20) {
  return getProperties(accountId, 'listed', offset, limit);
}

export function getPropertiesSaved(accountId: string, offset = 0, limit = 20) {
  return getProperties(accountId, 'saved', offset, limit);
}

export function getPropertiesOwned(accountId: string, offset = 0, limit = 20) {
  return getProperties(accountId, 'owned', offset, limit);
}

export function getPropertiesBeingWorked(accountId: string, offset = 0, limit = 20) {
  return getProperties(accountId, 'being-worked', offset, limit);
}
