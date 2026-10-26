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
to an `EstateApiResponse`: `{ ok, status, body, headers }`.

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
`GET|POST /bridge/api.v1/leads/[id]/activity`.

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

import { requestEstateApi, type EstateApiResponse } from '@neup/logica/estate/api';
import type { EstateObjectRecord } from '@neup/logica/estate/types';

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

const activity = {
  get(leadId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: `/bridge/api.v1/leads/${encodeURIComponent(leadId)}/activity`,
    });
  },

  post(leadId: string, input: EstateLeadActivityInput): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: `/bridge/api.v1/leads/${encodeURIComponent(leadId)}/activity`,
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
