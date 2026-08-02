/*
::neup.documentation::logica-estate-favorite-object
::title Logica Estate Favorite Object

Favorite methods for the nested estate object API.

::public

Use `logica.estate.favorite.*` for favorite API helpers.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@/logica/estate/api';

export const favorite = {
  save(propertyId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/favorite/save',
      method: 'POST',
      body: { propertyId },
    });
  },

  remove(propertyId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/favorite/remove',
      method: 'POST',
      body: { propertyId },
    });
  },

  list(): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/favorite/list',
    });
  },
} as const;

export default favorite;
