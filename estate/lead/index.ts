/*
::neup.documentation::logica-estate-lead-object
::title Logica Estate Lead Object

Lead methods for the nested estate object API.

::public

Use `logica.estate.lead.*` for lead API helpers.

List requests accept optional `limit` (default 10, maximum 25) and `offset`
(default 0). `base.list()` calls `/bridge/api.v1/leads/base`; `shared.list()`
calls `/bridge/api.v1/leads/shared`; `my.list()` also calls the shared endpoint,
which applies visibility rules for the authenticated account. The top-level `listBase()`,
`listShared()`, and `listMy()` methods are aliases for those methods.

Example requests:
```ts
const baseResponse = await logica.estate.lead.base.list({ limit: 10, offset: 0 });
const sharedResponse = await logica.estate.lead.shared.list({ limit: 10, offset: 0 });
const myResponse = await logica.estate.lead.my.list({ limit: 10, offset: 0 });
```

These send `GET /bridge/api.v1/leads/base?limit=10&offset=0` or
`GET /bridge/api.v1/leads/shared?limit=10&offset=0`. Each SDK method resolves
to an `ApiResponse`: `{ ok, status, body, headers }`.

Example response body for `base.list()`:
```json
{
  "data": [
    {
      "id": "cm_baselead123",
      "belongsTo": "account_123",
      "firstName": "Asha",
      "lastName": "Sharma",
      "contact": { "email": "asha@example.com", "phone": "+9779800000000" },
      "source": "website",
      "createdAt": "2026-10-27T08:15:00.000Z",
      "updatedAt": "2026-10-27T08:15:00.000Z",
      "leads": []
    }
  ],
  "pagination": { "limit": 10, "offset": 0, "total": 1, "hasMore": false }
}
```

Use `base.activity.get(baseLeadId)` to retrieve the combined timeline across
all shared leads attached to one base lead. Each activity includes a `lead`
object identifying its source shared lead. This is a read-only aggregate;
create activities through `lead.activity.post(sharedLeadId, input)`.

Example request:
```ts
const activitiesResponse = await logica.estate.lead.base.activity.get('cm_baselead123');
```

Example response body:
```json
{
  "data": [
    {
      "id": "cm_activity789",
      "leadId": "cm_sharedlead456",
      "data": {
        "activityType": "follow_up",
        "followUpMethod": "phone call",
        "propertyId": null,
        "propertyTitle": null,
        "remarks": "Called to discuss the buyer's requirements."
      },
      "activityOn": "2026-10-27T08:15:00.000Z",
      "activityBy": "Asha Sharma",
      "lead": { "id": "cm_sharedlead456", "type": "BUYER", "owner": "account_123" }
    }
  ]
}
```

Example response body for `shared.list()` and `my.list()`:
```json
{
  "data": [
    {
      "id": "cm_sharedlead456",
      "baseLeadId": "cm_baselead123",
      "type": "BUYER",
      "requirements": { "purpose": "Sale", "location": "Kathmandu" },
      "priority": "MEDIUM",
      "owner": "account_123",
      "createdAt": "2026-10-27T08:15:00.000Z",
      "updatedAt": "2026-10-27T08:15:00.000Z",
      "client": {
        "id": "cm_baselead123",
        "belongsTo": "account_123",
        "firstName": "Asha",
        "lastName": "Sharma",
        "contact": { "email": "asha@example.com", "phone": "+9779800000000" },
        "contacts": [
          { "id": "cm_contact789", "clientId": "cm_baselead123", "type": "email", "value": "asha@example.com" },
          { "id": "cm_contact790", "clientId": "cm_baselead123", "type": "phone", "value": "+9779800000000" }
        ],
        "source": "website",
        "createdAt": "2026-10-27T08:00:00.000Z",
        "updatedAt": "2026-10-27T08:00:00.000Z"
      }
    }
  ],
  "pagination": { "limit": 10, "offset": 0, "total": 1, "hasMore": false }
}
```

Lead activity is available with `lead.activity.get(leadId)` and
`lead.activity.post(leadId, input)`. These call
`GET|POST /bridge/api.v1/leads/[id]/activity`. If `activityOn` is omitted,
the API records the current server time; a supplied valid date is used as-is.

Example POST request:
```ts
const activityResponse = await logica.estate.lead.activity.get('cm_sharedlead456');
const response = await logica.estate.lead.activity.post('cm_sharedlead456', {
  activityType: 'follow_up',
  activityOn: '2026-10-27T08:15:00.000Z',
  followUpMethod: 'phone call',
  remarks: 'Called to discuss the buyer\'s requirements.',
});
```

Example GET response body:
```json
{
  "data": [
    {
      "id": "cm_activity789",
      "leadId": "cm_sharedlead456",
      "data": {
        "activityType": "follow_up",
        "followUpMethod": "phone call",
        "propertyId": null,
        "propertyTitle": null,
        "remarks": "Called to discuss the buyer's requirements."
      },
      "activityOn": "2026-10-27T08:15:00.000Z",
      "activityBy": "Asha Sharma"
    }
  ]
}
```

Example POST response body:
```json
{
  "success": true,
  "data": {
    "id": "cm_activity789",
    "leadId": "cm_sharedlead456",
    "data": {
      "activityType": "follow_up",
      "followUpMethod": "phone call",
      "propertyId": null,
      "propertyTitle": null,
      "remarks": "Called to discuss the buyer's requirements."
    },
    "activityOn": "2026-10-27T08:15:00.000Z",
    "activityBy": "Asha Sharma"
  }
}
```

::public end

::end
*/

import { runApi, type ApiResponse, type ApiMethod } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import endpointConfig from '@neup/logica/estate/endpoints.json';
import type { EstateObjectRecord } from '@neup/logica/estate/types';

const LeadsSharedConfig = (endpointConfig as Record<string, { path: string; method: ApiMethod }>)['leads:shared'];
const LeadsSharedEndpoint = LeadsSharedConfig.path;
const LeadsSharedMethod = LeadsSharedConfig.method;
const LeadsBaseEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/leads/base';
/** Builds the API endpoint for baseleadactivity. */
const getBaseLeadActivityEndpoint = (baseLeadId: string) => `https://neupgroup.com/estate/bridge/api.v1/leads/base/${encodeURIComponent(baseLeadId)}/activity`;
/** Builds the API endpoint for leadactivity. */
const getLeadActivityEndpoint = (leadId: string) => `https://neupgroup.com/estate/bridge/api.v1/leads/${encodeURIComponent(leadId)}/activity`;
const LeadFromInquiryEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/lead/from-inquiry';
const LeadStatusEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/lead/status';

export type EstateLeadListOptions = {
  limit?: number;
  offset?: number;
};

export type EstateLeadActivityInput = {
  activityType: 'follow_up' | 'visit' | 'meeting' | 'remarks';
  activityOn?: string;
  followUpMethod?: 'phone call' | 'whatsapp' | 'email';
  propertyId?: string;
  remarks: string;
};

function list(path: '/bridge/api.v1/leads/base' | '/bridge/api.v1/leads/shared', options: EstateLeadListOptions = {}): Promise<ApiResponse> {
  if (path.endsWith('/leads/shared')) {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: LeadsSharedEndpoint,
      method: LeadsSharedMethod,
      query: {
        limit: options.limit,
        offset: options.offset,
      },
    });
  }
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: LeadsBaseEndpoint,
    query: {
      limit: options.limit,
      offset: options.offset,
    },
  });
}

const base = {
  list(options: EstateLeadListOptions = {}): Promise<ApiResponse> {
    return list('/bridge/api.v1/leads/base', options);
  },

  activity: {
    get(baseLeadId: string): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: getBaseLeadActivityEndpoint(baseLeadId),
      });
    },
  },
} as const;

const shared = {
  list(options: EstateLeadListOptions = {}): Promise<ApiResponse> {
    return list('/bridge/api.v1/leads/shared', options);
  },
} as const;

const my = {
  list(options: EstateLeadListOptions = {}): Promise<ApiResponse> {
    // The endpoint derives the current account from authentication and applies
    // the same assignment visibility rules as the Shared Leads page.
    return list('/bridge/api.v1/leads/shared', options);
  },
} as const;

const activity = {
  get(leadId: string): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: getLeadActivityEndpoint(leadId),
    });
  },

  post(leadId: string, input: EstateLeadActivityInput): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: getLeadActivityEndpoint(leadId),
      method: 'POST',
      body: input,
    });
  },
} as const;

export const lead = {
  base,
  shared,
  my,
  activity,

  listBase(options: EstateLeadListOptions = {}): Promise<ApiResponse> {
    return base.list(options);
  },

  listShared(options: EstateLeadListOptions = {}): Promise<ApiResponse> {
    return shared.list(options);
  },

  listMy(options: EstateLeadListOptions = {}): Promise<ApiResponse> {
    return my.list(options);
  },

  createFromInquiry(inquiryId: string): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: LeadFromInquiryEndpoint,
      method: 'POST',
      body: { inquiryId },
    });
  },

  updateStatus(leadId: string, status: string): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: LeadStatusEndpoint,
      method: 'POST',
      body: { leadId, status },
    });
  },
} as const;

export type EstateLeadRecord = EstateObjectRecord;

export default lead;
