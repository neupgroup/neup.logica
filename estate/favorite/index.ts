/*
::neup.documentation::logica-estate-favorite-object
::title Logica Estate Favorite Object

Favorite methods for the nested estate object API.

::public

Use `logica.estate.favorite.*` for favorite API helpers.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';

// External packages required by this logic module.
const requiredPackages = [] as const;



const ListingsSavedEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/listings/saved';

export const favorite = {
  save(propertyId: string): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: ListingsSavedEndpoint,
      method: 'POST',
      body: { propertyId },
    });
  },

  remove(propertyId: string): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: ListingsSavedEndpoint,
      method: 'DELETE',
      query: { propertyId },
    });
  },

  list(account = 'me'): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: ListingsSavedEndpoint,
      query: { account },
    });
  },
} as const;

export default favorite;
