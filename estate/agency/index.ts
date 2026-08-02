/*
::neup.documentation::logica-estate-agency-object
::title Logica Estate Agency Object

Agency methods for the nested estate object API.

::public

Use `logica.estate.agency(agencyId).*` for one agency and
`logica.estate.agency(agencyId).property.*` for that agency's property scope.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@/logica/estate/api';
import { listEstateProperties, type EstatePropertyListResponseBody } from '@/logica/estate/property/list';

function getAgencyById(agencyId: string): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/agency/view',
    query: { agencyId },
  });
}

function listAgencyProperties(agencyId: string): Promise<EstateApiResponse<EstatePropertyListResponseBody>> {
  return listEstateProperties({ agencyId });
}

function listAgencyAgents(agencyId: string): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/agency/agents',
    query: { agencyId },
  });
}

function createAgencyPropertyScope(agencyId: string) {
  const scopedProperty = function scopedProperty(propertyId: string) {
    return {
      get(): Promise<EstateApiResponse> {
        return requestEstateApi({
          path: '/bridge/api.v1/property/view',
          query: { propertyId, agencyId },
        });
      },
    } as const;
  };

  scopedProperty.list = function list(): Promise<EstateApiResponse<EstatePropertyListResponseBody>> {
    return listAgencyProperties(agencyId);
  };

  return scopedProperty;
}

export function agency(agencyId: string) {
  return {
    get(): Promise<EstateApiResponse> {
      return getAgencyById(agencyId);
    },

    property: createAgencyPropertyScope(agencyId),

    agent: {
      list(): Promise<EstateApiResponse> {
        return listAgencyAgents(agencyId);
      },
    },
  } as const;
}

agency.getById = function getById(agencyId: string): Promise<EstateApiResponse> {
  return getAgencyById(agencyId);
};

agency.listProperties = function listProperties(
  agencyId: string,
): Promise<EstateApiResponse<EstatePropertyListResponseBody>> {
  return listAgencyProperties(agencyId);
};

agency.listAgents = function listAgents(agencyId: string): Promise<EstateApiResponse> {
  return listAgencyAgents(agencyId);
};

export type EstateAgencyScope = ReturnType<typeof agency>;

export type EstateAgencyPropertyScope = ReturnType<typeof createAgencyPropertyScope>;

export { listEstateProperties };

export type { EstatePropertyListResponseBody };

export default agency;
