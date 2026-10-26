/*
::neup.documentation::logica-estate-requirement-object
::title Logica Estate Requirement Object

Requirement collection and item methods for the estate SDK.

::public

Use `logica.estate.requirement.*` to list, create, retrieve, update, and
delete property requirements.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@neup/logica/estate/api';
import type { EstateRequirementData } from '@neup/logica/estate/types';

export type EstateRequirementListOptions = {
  limit?: number;
  offset?: number;
};

function list(options: EstateRequirementListOptions = {}, postedBy?: 'me'): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/requirements',
    query: {
      limit: options.limit,
      offset: options.offset,
      postedBy,
    },
  });
}

const my = {
  list(options: EstateRequirementListOptions = {}): Promise<EstateApiResponse> {
    return list(options, 'me');
  },
} as const;

export function requirement(requirementId: string) {
  return {
    get(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: `/bridge/api.v1/requirements/${encodeURIComponent(requirementId)}`,
      });
    },

    update(data: EstateRequirementData): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: `/bridge/api.v1/requirements/${encodeURIComponent(requirementId)}`,
        method: 'PATCH',
        body: data,
      });
    },

    delete(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: `/bridge/api.v1/requirements/${encodeURIComponent(requirementId)}`,
        method: 'DELETE',
      });
    },
  } as const;
}

requirement.list = function listAll(options: EstateRequirementListOptions = {}): Promise<EstateApiResponse> {
  return list(options);
};

requirement.create = function create(data: EstateRequirementData): Promise<EstateApiResponse> {
  return requestEstateApi({
    path: '/bridge/api.v1/requirements',
    method: 'POST',
    body: data,
  });
};

requirement.my = my;
requirement.listMine = function listMine(options: EstateRequirementListOptions = {}): Promise<EstateApiResponse> {
  return my.list(options);
};

export type { EstateRequirementData };
export default requirement;
