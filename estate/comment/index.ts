/*
::neup.documentation::logica-estate-comment-object
::title Logica Estate Comment Object

Callable comment object for estate comment records.

::public

Use `logica.estate.comment(id).remove()`.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '#/logica/estate/api';

export function comment(id: string) {
  return {
    remove(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/comment/remove',
        method: 'POST',
        body: { id },
      });
    },
  } as const;
}

export default comment;
