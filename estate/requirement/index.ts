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

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { EstateRequirementData } from '@neup/logica/estate/types';


/** Builds the API endpoint for requirement. */
const getRequirementEndpoint = (requirementId: string) => `https://neupgroup.com/estate/bridge/api.v1/requirements/${encodeURIComponent(requirementId)}`;
const RequirementsEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/requirements';

export type EstateRequirementListOptions = {
  limit?: number;
  offset?: number;
};

function list(options: EstateRequirementListOptions = {}, postedBy?: 'me'): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: RequirementsEndpoint,
    query: {
      limit: options.limit,
      offset: options.offset,
      postedBy,
    },
  });
}

const my = {
  list(options: EstateRequirementListOptions = {}): Promise<ApiResponse> {
    return list(options, 'me');
  },
} as const;

export function requirement(requirementId: string) {
  return {
    get(): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: getRequirementEndpoint(requirementId),
      });
    },

    update(data: EstateRequirementData): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: getRequirementEndpoint(requirementId),
        method: 'PATCH',
        body: data,
      });
    },

    delete(): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: getRequirementEndpoint(requirementId),
        method: 'DELETE',
      });
    },
  } as const;
}

requirement.list = function listAll(options: EstateRequirementListOptions = {}): Promise<ApiResponse> {
  return list(options);
};

requirement.create = function create(data: EstateRequirementData): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: RequirementsEndpoint,
    method: 'POST',
    body: data,
  });
};

requirement.my = my;
requirement.listMine = function listMine(options: EstateRequirementListOptions = {}): Promise<ApiResponse> {
  return my.list(options);
};

export type { EstateRequirementData };
export default requirement;
