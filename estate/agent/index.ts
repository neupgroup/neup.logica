/*
::neup.documentation::logica-estate-agent-object
::title Logica Estate Agent Object

Callable agent object for the estate SDK.

::public

Use `logica.estate.agent(agentId).*` for agent-scoped collections.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { EstateObjectRecord } from '@neup/logica/estate/types';


/** Builds the API endpoint for agentcollectionlist. */
const getAgentCollectionListEndpoint = (kind: string) => `https://neupgroup.com/estate/bridge/api.v1/${kind}/list`;
/** Builds the API endpoint for agentcollection. */
const getAgentCollectionEndpoint = (kind: string) => `https://neupgroup.com/estate/bridge/api.v1/${kind}`;
const AgentAssignPropertyEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/agent/assign-property';
const AgentPropertiesEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/agent/properties';

type ListKind = 'save' | 'comment' | 'inquiry' | 'visit' | 'offer';

function list(kind: ListKind, query: Record<string, string>) {
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: getAgentCollectionListEndpoint(kind),
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
        path: getAgentCollectionEndpoint(kind),
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

function assignAgentProperty(agentId: string, propertyId: string): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: AgentAssignPropertyEndpoint,
    method: 'POST',
    body: { agentId, propertyId },
  });
}

function createAgentPropertyScope(agentId: string) {
  const scopedProperty = function scopedProperty(propertyId: string) {
    return {
      assign(): Promise<ApiResponse> {
        return assignAgentProperty(agentId, propertyId);
      },

      offer: {
        get(): Promise<ApiResponse> {
          return list('offer', { agentId, propertyId });
        },
      },
    } as const;
  };

  scopedProperty.list = function listProperties(): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: AgentPropertiesEndpoint,
      query: { agentId },
    });
  };

  scopedProperty.assign = function assign(propertyId: string): Promise<ApiResponse> {
    return assignAgentProperty(agentId, propertyId);
  };

  return scopedProperty;
}

function createAgentUserScope(agentId: string) {
  return function user(userId: string) {
    const query = { agentId, userId };
    return {
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
    property: createAgentPropertyScope(agentId),
    user: createAgentUserScope(agentId),
    save: createListScope('save', query),
    comment: createListScope('comment', query),
    inquiry: createCreateListScope('inquiry', query),
    visit: createVisitScope(query),
    offer: createListScope('offer', query),
  } as const;
}

agent.listProperties = function listProperties(agentId: string): Promise<ApiResponse> {
  return agent(agentId).property.list();
};

agent.assignProperty = function assignProperty(agentId: string, propertyId: string): Promise<ApiResponse> {
  return agent(agentId).property.assign(propertyId);
};

export type EstateAgentScope = ReturnType<typeof agent>;

export default agent;
