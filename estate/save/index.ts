/*
::neup.documentation::logica-estate-save-object
::title Logica Estate Save Object

Callable saved-property object for estate save records.

::public

Use `logica.estate.save(id).remove()`.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@neup/logica/estate/api';

export type EstateSaveCreateData = { propertyId: string };

export const save = Object.assign(
  function save(id: string) {
    return {
      remove(): Promise<EstateApiResponse> {
        return requestEstateApi({
          path: '/bridge/api.v1/properties/saved',
          method: 'DELETE',
          query: { id },
        });
      },
    } as const;
  },
  {
    list(options: { account?: string; limit?: number; offset?: number } = {}): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/properties/saved',
        query: { account: options.account ?? 'me', limit: options.limit, offset: options.offset },
      });
    },

    create(data: EstateSaveCreateData): Promise<EstateApiResponse> {
      return requestEstateApi({ path: '/bridge/api.v1/properties/saved', method: 'POST', body: data });
    },

    removeProperty(propertyId: string): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/properties/saved',
        method: 'DELETE',
        query: { propertyId },
      });
    },
  },
);

export default save;
