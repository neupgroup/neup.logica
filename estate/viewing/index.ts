/*
::neup.documentation::logica-estate-viewing-object
::title Logica Estate Viewing Object

Viewing methods for the nested estate object API.

::public

Use `logica.estate.viewing.*` for viewing API helpers.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '#/logica/estate/api';
import type { EstateViewingData } from '#/logica/estate/types';

export const viewing = {
  schedule(data: EstateViewingData): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/viewing/schedule',
      method: 'POST',
      body: data,
    });
  },

  reschedule(viewingId: string, data: EstateViewingData): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/viewing/reschedule',
      method: 'POST',
      body: { viewingId, ...data },
    });
  },

  cancel(viewingId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/viewing/cancel',
      method: 'POST',
      body: { viewingId },
    });
  },
} as const;

export type { EstateViewingData };

export default viewing;
