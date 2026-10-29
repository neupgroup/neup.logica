/*
::neup.documentation::logica-estate-visit-object
::title Logica Estate Visit Object

Callable visit object for property visit scheduling.

::public

Use `logica.estate.visit().create(data)` to create a visit and
`logica.estate.visit(visitId).*` for one visit.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { EstateObjectRecord } from '@neup/logica/estate/types';


const VisitCreateEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/visit/create';
const VisitViewEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/visit/view';
const VisitCancelEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/visit/cancel';
const VisitUpdateEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/visit/update';
const VisitPostponeEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/visit/postpone';
const VisitSetTimeEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/visit/set-time';

export function visit(visitId?: string) {
  return {
    create(data: EstateObjectRecord = {}): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: VisitCreateEndpoint,
        method: 'POST',
        body: data,
      });
    },

    get(): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: VisitViewEndpoint,
        query: { visitId },
      });
    },

    cancel(data: EstateObjectRecord = {}): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: VisitCancelEndpoint,
        method: 'POST',
        body: { visitId, ...data },
      });
    },

    update(data: EstateObjectRecord = {}): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: VisitUpdateEndpoint,
        method: 'POST',
        body: { visitId, ...data },
      });
    },

    postpone(data: EstateObjectRecord = {}): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: VisitPostponeEndpoint,
        method: 'POST',
        body: { visitId, ...data },
      });
    },

    setTime(data: EstateObjectRecord = {}): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: VisitSetTimeEndpoint,
        method: 'POST',
        body: { visitId, ...data },
      });
    },
  } as const;
}

visit.create = function create(data: EstateObjectRecord = {}) {
  return visit().create(data);
};

export default visit;
