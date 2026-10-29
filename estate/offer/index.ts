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

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { EstateObjectRecord, EstateOfferData } from '@neup/logica/estate/types';


const OfferViewEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/offer/view';
const OfferAcceptEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/offer/accept';
const OfferRejectEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/offer/reject';
const OfferCreateEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/offer/create';
const OfferListEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/offer/list';

export function offer(offerId?: string) {
  return {
    get(): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: OfferViewEndpoint,
        query: { offerId },
      });
    },

    accept(): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: OfferAcceptEndpoint,
        method: 'POST',
        body: { offerId },
      });
    },

    reject(): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: OfferRejectEndpoint,
        method: 'POST',
        body: { offerId },
      });
    },
  } as const;
}

offer.create = function create(data: EstateOfferData): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: OfferCreateEndpoint,
    method: 'POST',
    body: data,
  });
};

offer.accept = function accept(offerId: string): Promise<ApiResponse> {
  return offer(offerId).accept();
};

offer.reject = function reject(offerId: string): Promise<ApiResponse> {
  return offer(offerId).reject();
};

offer.list = function list(query: EstateObjectRecord = {}): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: OfferListEndpoint,
    query: query as Record<string, string>,
  });
};

export type { EstateOfferData };

export default offer;
