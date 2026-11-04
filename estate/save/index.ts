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

// External packages required by this logic module.
const requiredPackages = [] as const;



const ListingsSavedEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/listings/saved';

export type EstateSaveCreateData = { propertyId: string };

export const save = Object.assign(
  function save(id: string) {
    return {
      remove(): Promise<ApiResponse> {
        return runApi({
          baseUrl: getBaseUrl('estate'),
          path: ListingsSavedEndpoint,
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
        path: ListingsSavedEndpoint,
        query: { account: options.account ?? 'me', limit: options.limit, offset: options.offset },
      });
    },

    create(data: EstateSaveCreateData): Promise<ApiResponse> {
      return runApi({
    baseUrl: getBaseUrl('estate'), path: ListingsSavedEndpoint, method: 'POST', body: data });
    },

    removeProperty(propertyId: string): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: ListingsSavedEndpoint,
        method: 'DELETE',
        query: { propertyId },
      });
    },
  },
);

export default save;
