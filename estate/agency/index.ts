/*
::neup.documentation::logica-estate-agency-object
::title Logica Estate Agency Object

Callable agency object for the estate SDK.

::public

Use `logica.estate.agency(agencyId).*` for agency-scoped collections.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '#/logica/estate/api';
import { listEstateProperties, type EstatePropertyListResponseBody } from '#/logica/estate/property/list';
import type { EstateObjectRecord } from '#/logica/estate/types';

type ListKind = 'reaction' | 'save' | 'comment' | 'inquiry' | 'visit' | 'offer';

function list(kind: ListKind, query: Record<string, string>) {
  return requestEstateApi({
    path: `/bridge/api.v1/${kind}/list`,
    query,
  });
}

function createListScope(kind: ListKind, query: Record<string, string>) {
  return {
    list(): Promise<EstateApiResponse> {
      return list(kind, query);
    },
  } as const;
}

function createCreateListScope(kind: 'inquiry', query: Record<string, string>) {
  return {
    create(data: EstateObjectRecord = {}): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: `/bridge/api.v1/${kind}`,
        method: 'POST',
        body: { ...query, ...data },
      });
    },

    list(): Promise<EstateApiResponse> {
      return list(kind, query);
    },
  } as const;
}

function createVisitScope(query: Record<string, string>) {
  return {
    status(status: string) {
      return {
        list(): Promise<EstateApiResponse> {
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
        get(): Promise<EstateApiResponse> {
          return list('offer', { agencyId, propertyId });
        },
      },
    } as const;
  };

  scopedProperty.list = function listProperties(): Promise<EstateApiResponse<EstatePropertyListResponseBody>> {
    return listEstateProperties({ agencyId });
  };

  return scopedProperty;
}

function createAgencyUserScope(agencyId: string) {
  return function user(userId: string) {
    const query = { agencyId, userId };
    return {
      reaction: createListScope('reaction', query),
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
    get(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/agency/view',
        query,
      });
    },

    property: createAgencyPropertyScope(agencyId),
    user: createAgencyUserScope(agencyId),
    reaction: createListScope('reaction', query),
    save: createListScope('save', query),
    comment: createListScope('comment', query),
    inquiry: createCreateListScope('inquiry', query),
    visit: createVisitScope(query),
    offer: {
      get(): Promise<EstateApiResponse> {
        return list('offer', query);
      },

      list(): Promise<EstateApiResponse> {
        return list('offer', query);
      },
    },
    agent: {
      list(): Promise<EstateApiResponse> {
        return requestEstateApi({
          path: '/bridge/api.v1/agency/agents',
          query,
        });
      },
    },
  } as const;
}

agency.getById = function getById(agencyId: string): Promise<EstateApiResponse> {
  return agency(agencyId).get();
};

agency.listProperties = function listProperties(
  agencyId: string,
): Promise<EstateApiResponse<EstatePropertyListResponseBody>> {
  return agency(agencyId).property.list();
};

agency.listAgents = function listAgents(agencyId: string): Promise<EstateApiResponse> {
  return agency(agencyId).agent.list();
};

export { listEstateProperties };

export type { EstatePropertyListResponseBody };

export type EstateAgencyScope = ReturnType<typeof agency>;

export default agency;
