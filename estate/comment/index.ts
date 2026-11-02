/*
::neup.documentation::logica-estate-comment-object
::title Logica Estate Comment Object

Callable comment object for estate comment records.

::public

Use `logica.estate.comment(id).remove()`.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';

// External packages required by this logic module.
const requiredPackages = [] as const;



const CommentRemoveEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/comment/remove';

export function comment(id: string) {
  return {
    remove(): Promise<ApiResponse> {
      return runApi({
        baseUrl: getBaseUrl('estate'),
        path: CommentRemoveEndpoint,
        method: 'POST',
        body: { id },
      });
    },
  } as const;
}

export default comment;
