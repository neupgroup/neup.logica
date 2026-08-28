/*
::neup.documentation::logica-estate-offer-object
::title Logica Estate Offer Object

Offer helpers for the estate SDK.

::public

Most offer operations are exposed through scoped chains such as
`property(id).offer(data).create()` and `agent(id).offer.list()`.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '#/logica/estate/api';
import type { EstateObjectRecord, EstateOfferData } from '#/logica/estate/types';

export function offer(offerId?: string) {
  return {
    get(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/offer/view',
        query: { offerId },
      });
    },

    accept(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/offer/accept',
        method: 'POST',
        body: { offerId },
      });
    },

    reject(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/offer/reject',
        method: 'POST',
        body: { offerId },
      });
    },
  } as const;
}

offer.create = function create(data: EstateOfferData): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/offer/create',
    method: 'POST',
    body: data,
  });
};

offer.accept = function accept(offerId: string): Promise<EstateApiResponse> {
  return offer(offerId).accept();
};

offer.reject = function reject(offerId: string): Promise<EstateApiResponse> {
  return offer(offerId).reject();
};

offer.list = function list(query: EstateObjectRecord = {}): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/offer/list',
    query: query as Record<string, string>,
  });
};

export type { EstateOfferData };

export default offer;
