/*
::neup.documentation::logica-estate-viewing-object
::title Logica Estate Viewing Object

Viewing methods for the nested estate object API.

::public

Use `logica.estate.viewing.*` for viewing API helpers.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { EstateViewingData } from '@neup/logica/estate/types';


const ViewingScheduleEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/viewing/schedule';
const ViewingRescheduleEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/viewing/reschedule';
const ViewingCancelEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/viewing/cancel';

export const viewing = {
  schedule(data: EstateViewingData): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: ViewingScheduleEndpoint,
      method: 'POST',
      body: data,
    });
  },

  reschedule(viewingId: string, data: EstateViewingData): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: ViewingRescheduleEndpoint,
      method: 'POST',
      body: { viewingId, ...data },
    });
  },

  cancel(viewingId: string): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: ViewingCancelEndpoint,
      method: 'POST',
      body: { viewingId },
    });
  },
} as const;

export type { EstateViewingData };

export default viewing;
