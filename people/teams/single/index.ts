import { api, type ApiResponse } from '@neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { PeopleTeamResponseBody } from '../index';

export function team(projectId: string, reference: string) {
  return {
    async get(): Promise<ApiResponse<PeopleTeamResponseBody>> {
      return api.atPath(url.web.path(getBaseUrl('sites')).addPath(`/bridge/api.v1/project/${projectId}/team/${encodeURIComponent(reference)}`).get())
        .addHeader(`x-project: ${projectId}`).failOnError(false).run() as Promise<ApiResponse<PeopleTeamResponseBody>>;
    },
  } as const;
}

export type TeamSingleScope = ReturnType<typeof team>;
export default team;
