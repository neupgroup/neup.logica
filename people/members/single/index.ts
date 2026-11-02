import { api, type ApiResponse } from '@neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { PeopleMemberResponseBody } from '../index';

// External packages required by this logic module.
const requiredPackages = [] as const;


export function member(projectId: string, reference: string) {
  return {
    async get(): Promise<ApiResponse<PeopleMemberResponseBody>> {
      return api.atPath(url.web.path(getBaseUrl('sites')).addPath(`/bridge/api.v1/members/${encodeURIComponent(reference)}`).get())
        .addHeader(`x-project: ${projectId}`).failOnError(false).run() as Promise<ApiResponse<PeopleMemberResponseBody>>;
    },
  } as const;
}

export type MemberSingleScope = ReturnType<typeof member>;
export default member;
