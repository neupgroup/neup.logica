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


const PropertiesSavedEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/properties/saved';

export const favorite = {
  save(propertyId: string): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: PropertiesSavedEndpoint,
      method: 'POST',
      body: { propertyId },
    });
  },

  remove(propertyId: string): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: PropertiesSavedEndpoint,
      method: 'DELETE',
      query: { propertyId },
    });
  },

  list(account = 'me'): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: PropertiesSavedEndpoint,
      query: { account },
    });
  },
} as const;

export default favorite;
