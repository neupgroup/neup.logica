/*
::neup.documentation::logica-estate-reaction-object
::title Logica Estate Reaction Object

Callable reaction object for estate reaction records.

::public

Use `logica.estate.reaction(id).remove()`.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@neup/logica/estate/api';

export type EstateReactionValue = 'Liked' | 'Disliked' | 'Reported';
export type EstateReactionCreateData = { propertyId: string; reaction: EstateReactionValue };

export const reaction = Object.assign(
  function reaction(id: string) {
    return {
      remove(): Promise<EstateApiResponse> {
        return requestEstateApi({
          path: '/bridge/api.v1/properties/reacted',
          method: 'DELETE',
          query: { id },
        });
      },
    } as const;
  },
  {
    list(options: { account?: string; propertyId?: string; limit?: number; offset?: number } = {}): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/properties/reacted',
        query: { account: options.account ?? 'me', propertyId: options.propertyId, limit: options.limit, offset: options.offset },
      });
    },

    create(data: EstateReactionCreateData): Promise<EstateApiResponse> {
      return requestEstateApi({ path: '/bridge/api.v1/properties/reacted', method: 'POST', body: data });
    },
  },
);

export default reaction;
