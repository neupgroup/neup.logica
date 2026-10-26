/*
::neup.documentation::logica-estate-favorite-object
::title Logica Estate Favorite Object

Favorite methods for the nested estate object API.

::public

Use `logica.estate.favorite.*` for favorite API helpers.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@neup/logica/estate/api';

export const favorite = {
  save(propertyId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/properties/saved',
      method: 'POST',
      body: { propertyId },
    });
  },

  remove(propertyId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/properties/saved',
      method: 'DELETE',
      query: { propertyId },
    });
  },

  list(account = 'me'): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/properties/saved',
      query: { account },
    });
  },
} as const;

export default favorite;
