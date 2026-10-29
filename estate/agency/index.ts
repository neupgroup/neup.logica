/*
::neup.documentation::logica-estate-agency-object
::title Logica Estate Agency Object

Callable agency object for the estate SDK.

::public

Use `logica.estate.agency(agencyId).*` for agency-scoped collections.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import { listEstateProperties, type EstatePropertyListResponseBody } from '@neup/logica/estate/property/list';
import type { EstateObjectRecord } from '@neup/logica/estate/types';


/** Builds the API endpoint for agencycollectionlist. */
const getAgencyCollectionListEndpoint = (kind: string) => `https://neupgroup.com/estate/bridge/api.v1/${kind}/list`;
/** Builds the API endpoint for agencycollection. */
const getAgencyCollectionEndpoint = (kind: string) => `https://neupgroup.com/estate/bridge/api.v1/${kind}`;
const AgencyAgentsEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/agency/agents';

type ListKind = 'save' | 'comment' | 'inquiry' | 'visit' | 'offer';

function list(kind: ListKind, query: Record<string, string>) {
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: getAgencyCollectionListEndpoint(kind),
    query,
  });
}

function createListScope(kind: ListKind, query: Record<string, string>) {
  return {
    list(): Promise<ApiResponse> {
      return list(kind, query);
    },
  } as const;
}

function createCreateListScope(kind: 'inquiry', query: Record<string, string>) {
  return {
    create(data: EstateObjectRecord = {}): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: getAgencyCollectionEndpoint(kind),
        method: 'POST',
        body: { ...query, ...data },
      });
    },

    list(): Promise<ApiResponse> {
      return list(kind, query);
    },
  } as const;
}

function createVisitScope(query: Record<string, string>) {
  return {
    status(status: string) {
      return {
        list(): Promise<ApiResponse> {
          return list('visit', { ...query, status });
        },
      } as const;
    },
  } as const;
}

function createAgencyPropertyScope(agencyId: string) {
  const scopedProperty = function scopedProperty(propertyId: string) {
    return {
      offer: {
        get(): Promise<ApiResponse> {
          return list('offer', { agencyId, propertyId });
        },
      },
    } as const;
  };

  scopedProperty.list = function listProperties(): Promise<ApiResponse<EstatePropertyListResponseBody>> {
    return listEstateProperties({ agencyId });
  };

  return scopedProperty;
}

function createAgencyUserScope(agencyId: string) {
  return function user(userId: string) {
    const query = { agencyId, userId };
    return {
      save: createListScope('save', query),
      comment: createListScope('comment', query),
      inquiry: createListScope('inquiry', query),
      visit: createVisitScope(query),
    } as const;
  };
}

export function agency(agencyId: string) {
  const query = { agencyId };
  return {
    property: createAgencyPropertyScope(agencyId),
    user: createAgencyUserScope(agencyId),
    save: createListScope('save', query),
    comment: createListScope('comment', query),
    inquiry: createCreateListScope('inquiry', query),
    visit: createVisitScope(query),
    offer: {
      get(): Promise<ApiResponse> {
        return list('offer', query);
      },

      list(): Promise<ApiResponse> {
        return list('offer', query);
      },
    },
    agent: {
      list(): Promise<ApiResponse> {
        return runApi({
          baseUrl: getBaseUrl('estate'),
          path: AgencyAgentsEndpoint,
          query,
        });
      },
    },
  } as const;
}

agency.listProperties = function listProperties(
  agencyId: string,
): Promise<ApiResponse<EstatePropertyListResponseBody>> {
  return agency(agencyId).property.list();
};

agency.listAgents = function listAgents(agencyId: string): Promise<ApiResponse> {
  return agency(agencyId).agent.list();
};

export { listEstateProperties };

export type { EstatePropertyListResponseBody };

export type EstateAgencyScope = ReturnType<typeof agency>;

export default agency;
