/*
::neup.documentation::logica-estate-agent-object
::title Logica Estate Agent Object

Agent methods for the nested estate object API.

::public

Use `logica.estate.agent(agentId).*` for one agent and
`logica.estate.agent(agentId).property.*` for that agent's property scope.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@/logica/estate/api';

function getAgentById(agentId: string): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/agent/view',
    query: { agentId },
  });
}

function listAgentProperties(agentId: string): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/agent/properties',
    query: { agentId },
  });
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
    } as const;
  };

  scopedProperty.list = function list(): Promise<EstateApiResponse> {
    return listAgentProperties(agentId);
  };

  scopedProperty.assign = function assign(propertyId: string): Promise<EstateApiResponse> {
    return assignAgentProperty(agentId, propertyId);
  };

  return scopedProperty;
}

export function agent(agentId: string) {
  return {
    get(): Promise<EstateApiResponse> {
      return getAgentById(agentId);
    },

    property: createAgentPropertyScope(agentId),
  } as const;
}

agent.getById = function getById(agentId: string): Promise<EstateApiResponse> {
  return getAgentById(agentId);
};

agent.listProperties = function listProperties(agentId: string): Promise<EstateApiResponse> {
  return listAgentProperties(agentId);
};

agent.assignProperty = function assignProperty(agentId: string, propertyId: string): Promise<EstateApiResponse> {
  return assignAgentProperty(agentId, propertyId);
};

export type EstateAgentScope = ReturnType<typeof agent>;

export type EstateAgentPropertyScope = ReturnType<typeof createAgentPropertyScope>;

export default agent;
