/*
::neup.documentation::logica-estate-inquiry-object
::title Logica Estate Inquiry Object

Callable inquiry object for the estate SDK.

::public

Use `logica.estate.inquiry.create(data)` for new inquiries and
`logica.estate.inquiry(inquiryId).*` for one inquiry.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@/logica/estate/api';
import type { EstateInquiryCreateData, EstateObjectRecord } from '@/logica/estate/types';

function createInquiry(data: EstateInquiryCreateData = {}): Promise<EstateApiResponse> {
  const propertyId = data.propertyId ?? data.property ?? data.property_id;
  return requestEstateApi({
    path: '/bridge/api.v1/inquiry',
    method: 'POST',
    query: { property: propertyId },
    body: data,
  });
}

export function inquiry(inquiryId: string) {
  return {
    get(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/inquiry/view',
        query: { inquiryId },
      });
    },

    drop(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/inquiry/drop',
        method: 'POST',
        body: { inquiryId },
      });
    },

    update(data: EstateObjectRecord = {}): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/inquiry/update',
        method: 'POST',
        body: { inquiryId, ...data },
      });
    },

    convert(data: EstateObjectRecord = {}): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/lead/from-inquiry',
        method: 'POST',
        body: { inquiryId, ...data },
      });
    },
  } as const;
}

inquiry.create = createInquiry;

inquiry.listForProperty = function listForProperty(propertyId: string): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/inquiry/list',
    query: { propertyId },
  });
};

inquiry.assignToAgent = function assignToAgent(inquiryId: string, agentId: string): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/inquiry/assign-agent',
    method: 'POST',
    body: { inquiryId, agentId },
  });
};

export type { EstateInquiryCreateData };

export default inquiry;
