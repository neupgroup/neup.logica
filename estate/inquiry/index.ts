/*
::neup.documentation::logica-estate-inquiry-object
::title Logica Estate Inquiry Object

Inquiry methods for the nested estate object API.

::public

Use `logica.estate.inquiry.*` for inquiry API helpers.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@/logica/estate/api';
import type { EstateInquiryCreateData } from '@/logica/estate/types';

export const inquiry = {
  create(data: EstateInquiryCreateData): Promise<EstateApiResponse> {
    const propertyId = data.propertyId ?? data.property ?? data.property_id;
    return requestEstateApi({
      path: '/bridge/api.v1/inquiry',
      method: 'POST',
      query: { property: propertyId },
      body: data,
    });
  },

  listForProperty(propertyId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/inquiry/list',
      query: { propertyId },
    });
  },

  assignToAgent(inquiryId: string, agentId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/inquiry/assign-agent',
      method: 'POST',
      body: { inquiryId, agentId },
    });
  },
} as const;

export type { EstateInquiryCreateData };

export default inquiry;
