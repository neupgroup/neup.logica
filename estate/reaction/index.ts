/*
::neup.documentation::logica-estate-reaction-object
::title Logica Estate Reaction Object

Callable reaction object for estate reaction records.

::public

Use `logica.estate.reaction(id).remove()`.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '#/logica/estate/api';

export function reaction(id: string) {
  return {
    remove(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/reaction/remove',
        method: 'POST',
        body: { id },
      });
    },
  } as const;
}

export default reaction;
