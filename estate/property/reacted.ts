/*
::neup.documentation::logica-estate-property-reacted
::title Logica Estate Reacted Properties

Reacted-property collection methods for the estate property namespace.

::public

Use `logica.estate.property.reacted.list({ account: 'me' })` to list reactions.
Use each returned `propertyId` with `logica.estate.property(id).get()` to fetch
property details.

::public end
::end
*/

import { requestEstateApi, type EstateApiResponse } from '@neup/logica/estate/api';

export type EstatePropertyReactionValue = 'Liked' | 'Disliked' | 'Reported';

export type EstateReactedPropertiesListOptions = {
  account?: string;
  limit?: number;
  offset?: number;
};

export type EstateReactedPropertyRemoval =
  | { id: string; propertyId?: never }
  | { propertyId: string; id?: never };

export const reactedProperties = {
  list(options: EstateReactedPropertiesListOptions = {}): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/properties/reacted',
      query: {
        account: options.account ?? 'me',
        limit: options.limit,
        offset: options.offset,
      },
    });
  },

  react(propertyId: string, reaction: EstatePropertyReactionValue): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/properties/reacted',
      method: 'POST',
      body: { propertyId, reaction },
    });
  },

  remove(input: EstateReactedPropertyRemoval): Promise<EstateApiResponse> {
    return requestEstateApi({
      path: '/bridge/api.v1/properties/reacted',
      method: 'DELETE',
      query: input,
    });
  },
} as const;

export default reactedProperties;
