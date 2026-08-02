/*
::neup.documentation::logica-estate-offer-object
::title Logica Estate Offer Object

Offer methods for the nested estate object API.

::public

Use `logica.estate.offer.*` for offer API helpers.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@/logica/estate/api';
import type { EstateOfferData } from '@/logica/estate/types';

export const offer = {
  create(data: EstateOfferData): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/offer/create',
      method: 'POST',
      body: data,
    });
  },

  accept(offerId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/offer/accept',
      method: 'POST',
      body: { offerId },
    });
  },

  reject(offerId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/offer/reject',
      method: 'POST',
      body: { offerId },
    });
  },
} as const;

export type { EstateOfferData };

export default offer;
