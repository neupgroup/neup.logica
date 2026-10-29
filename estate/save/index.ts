/*
::neup.documentation::logica-estate-save-object
::title Logica Estate Save Object

Callable saved-property object for estate save records.

::public

Use `logica.estate.save(id).remove()`.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';


const PropertiesSavedEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/properties/saved';

export type EstateSaveCreateData = { propertyId: string };

export const save = Object.assign(
  function save(id: string) {
    return {
      remove(): Promise<ApiResponse> {
        return runApi({
          baseUrl: getBaseUrl('estate'),
          path: PropertiesSavedEndpoint,
          method: 'DELETE',
          query: { id },
        });
      },
    } as const;
  },
  {
    list(options: { account?: string; limit?: number; offset?: number } = {}): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: PropertiesSavedEndpoint,
        query: { account: options.account ?? 'me', limit: options.limit, offset: options.offset },
      });
    },

    create(data: EstateSaveCreateData): Promise<ApiResponse> {
      return runApi({
    baseUrl: getBaseUrl('estate'), path: PropertiesSavedEndpoint, method: 'POST', body: data });
    },

    removeProperty(propertyId: string): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: PropertiesSavedEndpoint,
        method: 'DELETE',
        query: { propertyId },
      });
    },
  },
);

export default save;
