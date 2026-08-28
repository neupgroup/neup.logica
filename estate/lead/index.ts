/*
::neup.documentation::logica-estate-lead-object
::title Logica Estate Lead Object

Lead methods for the nested estate object API.

::public

Use `logica.estate.lead.*` for lead API helpers.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '#/logica/estate/api';

export const lead = {
  createFromInquiry(inquiryId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/lead/from-inquiry',
      method: 'POST',
      body: { inquiryId },
    });
  },

  updateStatus(leadId: string, status: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/lead/status',
      method: 'POST',
      body: { leadId, status },
    });
  },
} as const;

export default lead;
