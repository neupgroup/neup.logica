/*
::neup.documentation::logica-estate-agent-object
::title Logica Estate Agent Object

Callable agent object for the estate SDK.

::public

Use `logica.estate.agent(agentId).*` for agent-scoped collections.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@/logica/estate/api';
import type { EstateObjectRecord } from '@/logica/estate/types';

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

function assignAgentProperty(agentId: string, propertyId: string): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/agent/assign-property',
    method: 'POST',
    body: { agentId, propertyId },
  });
}

function createAgentPropertyScope(agentId: string) {
  const scopedProperty = function scopedProperty(propertyId: string) {
    return {
      assign(): Promise<EstateApiResponse> {
        return assignAgentProperty(agentId, propertyId);
      },

      offer: {
        get(): Promise<EstateApiResponse> {
          return list('offer', { agentId, propertyId });
        },
      },
    } as const;
  };

  scopedProperty.list = function listProperties(): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/agent/properties',
      query: { agentId },
    });
  };

  scopedProperty.assign = function assign(propertyId: string): Promise<EstateApiResponse> {
    return assignAgentProperty(agentId, propertyId);
  };

  return scopedProperty;
}

function createAgentUserScope(agentId: string) {
  return function user(userId: string) {
    const query = { agentId, userId };
    return {
      reaction: createListScope('reaction', query),
      save: createListScope('save', query),
      comment: createListScope('comment', query),
      inquiry: createListScope('inquiry', query),
      visit: createVisitScope(query),
    } as const;
  };
}

export function agent(agentId: string) {
  const query = { agentId };
  return {
    get(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/agent/view',
        query,
      });
    },

    property: createAgentPropertyScope(agentId),
    user: createAgentUserScope(agentId),
    reaction: createListScope('reaction', query),
    save: createListScope('save', query),
    comment: createListScope('comment', query),
    inquiry: createCreateListScope('inquiry', query),
    visit: createVisitScope(query),
    offer: createListScope('offer', query),
  } as const;
}

agent.getById = function getById(agentId: string): Promise<EstateApiResponse> {
  return agent(agentId).get();
};

agent.listProperties = function listProperties(agentId: string): Promise<EstateApiResponse> {
  return agent(agentId).property.list();
};

agent.assignProperty = function assignProperty(agentId: string, propertyId: string): Promise<EstateApiResponse> {
  return agent(agentId).property.assign(propertyId);
};

export type EstateAgentScope = ReturnType<typeof agent>;

export default agent;
