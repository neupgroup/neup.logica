/*
::neup.documentation::logica-estate-property-saved
::title Logica Estate Saved Properties

Saved-property collection methods for the estate property namespace.

::public

Use `logica.estate.property.saved.list({ account: 'me' })` to list saved
property records. Use `logica.estate.property(id).get()` with each returned
`propertyId` to fetch the property details.

::public end
::end
*/

import { requestEstateApi, type EstateApiResponse } from '@neup/logica/estate/api';

export type EstateSavedPropertiesListOptions = {
  account?: string;
  limit?: number;
  offset?: number;
};

export type EstateSavedPropertyRemoval =
  | { id: string; propertyId?: never }
  | { propertyId: string; id?: never };

export const savedProperties = {
  list(options: EstateSavedPropertiesListOptions = {}): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/properties/saved',
      query: {
        account: options.account ?? 'me',
        limit: options.limit,
        offset: options.offset,
      },
    });
  },

  save(propertyId: string): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/properties/saved',
      method: 'POST',
      body: { propertyId },
    });
  },

  remove(input: EstateSavedPropertyRemoval): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/properties/saved',
      method: 'DELETE',
      query: input,
    });
  },
} as const;

export default savedProperties;
