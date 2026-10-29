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

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { EstateInquiryCreateData, EstateObjectRecord } from '@neup/logica/estate/types';


const InquiryEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/inquiry';
const InquiryViewEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/inquiry/view';
const InquiryDropEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/inquiry/drop';
const InquiryUpdateEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/inquiry/update';
const LeadFromInquiryEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/lead/from-inquiry';
const InquiryListEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/inquiry/list';
const InquiryAssignAgentEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/inquiry/assign-agent';

function createInquiry(data: EstateInquiryCreateData = {}): Promise<ApiResponse> {
  const propertyId = data.propertyId ?? data.property ?? data.property_id;
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: InquiryEndpoint,
    method: 'POST',
    query: { property: propertyId },
    body: data,
  });
}

export function inquiry(inquiryId: string) {
  return {
    get(): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: InquiryViewEndpoint,
        query: { inquiryId },
      });
    },

    drop(): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: InquiryDropEndpoint,
        method: 'POST',
        body: { inquiryId },
      });
    },

    update(data: EstateObjectRecord = {}): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: InquiryUpdateEndpoint,
        method: 'POST',
        body: { inquiryId, ...data },
      });
    },

    convert(data: EstateObjectRecord = {}): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: LeadFromInquiryEndpoint,
        method: 'POST',
        body: { inquiryId, ...data },
      });
    },
  } as const;
}

inquiry.create = createInquiry;

inquiry.listForProperty = function listForProperty(propertyId: string): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: InquiryListEndpoint,
    query: { propertyId },
  });
};

inquiry.assignToAgent = function assignToAgent(inquiryId: string, agentId: string): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: InquiryAssignAgentEndpoint,
    method: 'POST',
    body: { inquiryId, agentId },
  });
};

export type { EstateInquiryCreateData };

export default inquiry;
