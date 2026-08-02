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

import { requestEstateApi, type EstateApiResponse } from '@/logica/estate/api';
import type { EstateObjectRecord } from '@/logica/estate/types';

export function visit(visitId?: string) {
  return {
    create(data: EstateObjectRecord = {}): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/visit/create',
        method: 'POST',
        body: data,
      });
    },

    get(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/visit/view',
        query: { visitId },
      });
    },

    cancel(data: EstateObjectRecord = {}): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/visit/cancel',
        method: 'POST',
        body: { visitId, ...data },
      });
    },

    update(data: EstateObjectRecord = {}): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/visit/update',
        method: 'POST',
        body: { visitId, ...data },
      });
    },

    postpone(data: EstateObjectRecord = {}): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/visit/postpone',
        method: 'POST',
        body: { visitId, ...data },
      });
    },

    setTime(data: EstateObjectRecord = {}): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/visit/set-time',
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
