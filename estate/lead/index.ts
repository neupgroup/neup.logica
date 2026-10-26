/*
::neup.documentation::logica-estate-lead-object
::title Logica Estate Lead Object

Lead methods for the nested estate object API.

::public

Use `logica.estate.lead.*` for lead API helpers.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@neup/logica/estate/api';
import type { EstateObjectRecord } from '@neup/logica/estate/types';

export type EstateLeadListOptions = {
  limit?: number;
  offset?: number;
};

function list(path: '/bridge/api.v1/leads/base' | '/bridge/api.v1/leads/shared', options: EstateLeadListOptions = {}): Promise<EstateApiResponse> {
  return requestEstateApi({
    path,
    query: {
      limit: options.limit,
      offset: options.offset,
    },
  });
}

const base = {
  list(options: EstateLeadListOptions = {}): Promise<EstateApiResponse> {
    return list('/bridge/api.v1/leads/base', options);
  },
} as const;

const shared = {
  list(options: EstateLeadListOptions = {}): Promise<EstateApiResponse> {
    return list('/bridge/api.v1/leads/shared', options);
  },
} as const;

const my = {
  list(options: EstateLeadListOptions = {}): Promise<EstateApiResponse> {
    // The endpoint derives the current account from authentication and applies
    // the same assignment visibility rules as the Shared Leads page.
    return list('/bridge/api.v1/leads/shared', options);
  },
} as const;

export const lead = {
  base,
  shared,
  my,

  listBase(options: EstateLeadListOptions = {}): Promise<EstateApiResponse> {
    return base.list(options);
  },

  listShared(options: EstateLeadListOptions = {}): Promise<EstateApiResponse> {
    return shared.list(options);
  },

  listMy(options: EstateLeadListOptions = {}): Promise<EstateApiResponse> {
    return my.list(options);
  },

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

export type EstateLeadRecord = EstateObjectRecord;

export default lead;
