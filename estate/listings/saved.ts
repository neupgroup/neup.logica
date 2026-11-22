/*
::neup.documentation::logica-estate-listings-saved
::title Logica Estate Saved Listings

Saved-listing collection methods for the estate listings namespace.

::public

Use `logica.estate.listings.saved.list({ account: 'me' })` to list saved
listing records. Use each record's listing slug identifier with
`logica.estate.listings(slug).get()` to fetch listing details.

::public end
::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';

// External packages required by this logic module.
const requiredPackages = [] as const;



const ListingsSavedEndpoint = 'bridge/api.v1/listings/saved';

export type EstateSavedListingsListOptions = {
  account?: string;
  limit?: number;
  offset?: number;
};

export type EstateSavedListingRemoval =
  | { id: string; slug?: never }
  | { slug: string; id?: never };

export const savedListings = {
  list(options: EstateSavedListingsListOptions = {}): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: ListingsSavedEndpoint,
      query: {
        account: options.account ?? 'me',
        limit: options.limit,
        offset: options.offset,
      },
    });
  },

  save(slug: string): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: ListingsSavedEndpoint,
      method: 'POST',
      body: { slug },
    });
  },

  remove(input: EstateSavedListingRemoval): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: ListingsSavedEndpoint,
      method: 'DELETE',
      query: input,
    });
  },
} as const;

export default savedListings;
