/*
::neup.documentation::logica-estate-save-object
::title Logica Estate Save Object

Callable saved-property object for estate save records.

::public

Use `logica.estate.save(id).remove()`.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '@/logica/estate/api';

export function save(id: string) {
  return {
    remove(): Promise<EstateApiResponse> {
      return requestEstateApi({
        path: '/bridge/api.v1/save/remove',
        method: 'POST',
        body: { id },
      });
    },
  } as const;
}

export default save;
