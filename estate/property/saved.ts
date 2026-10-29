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

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';


const PropertiesSavedEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/properties/saved';

export type EstateSavedPropertiesListOptions = {
  account?: string;
  limit?: number;
  offset?: number;
};

export type EstateSavedPropertyRemoval =
  | { id: string; propertyId?: never }
  | { propertyId: string; id?: never };

export const savedProperties = {
  list(options: EstateSavedPropertiesListOptions = {}): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: PropertiesSavedEndpoint,
      query: {
        account: options.account ?? 'me',
        limit: options.limit,
        offset: options.offset,
      },
    });
  },

  save(propertyId: string): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: PropertiesSavedEndpoint,
      method: 'POST',
      body: { propertyId },
    });
  },

  remove(input: EstateSavedPropertyRemoval): Promise<ApiResponse> {
    return runApi({
      baseUrl: getBaseUrl('estate'),
      path: PropertiesSavedEndpoint,
      method: 'DELETE',
      query: input,
    });
  },
} as const;

export default savedProperties;
