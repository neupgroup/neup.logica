/**
 * Teams requests and responses.
 *
 * ```ts
 * const response = await logica.people(projectId).teams.get();
 * // Error: { success: false, error: 'Team collection endpoint is not available.' }
 *
 * const response = await logica.people(projectId).team('team_123').get();
 * // Success: { success: true, data: { id: 'team_123', name: 'Design' } }
 * // Error:   { success: false, error: 'Team not found.' }
 * ```
 *
 * The project ID is sent as the `x-project` header.
 */
import { api, type ApiResponse } from '@neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';

export interface PeopleTeam {
  id: string;
  assetId: string;
  slug: string;
  name: string;
  description: string | null;
  order: number | null;
}

export interface PeopleTeamResponseBody {
  success: boolean;
  data?: PeopleTeam | PeopleTeam[];
  error?: string;
}

function endpoint(projectId: string, id: string) {
  const baseUrl = getBaseUrl('sites');

  return {
    apiPath: url.web.path(baseUrl).addPath(`/bridge/api.v1/project/${projectId}/team/${id}`).get(),
    projectId,
  };
}

export async function teams(projectId: string) {
  return {
    success: false,
    error: 'Team collection endpoint is not available.',
  } as unknown as ApiResponse<PeopleTeamResponseBody>;
}

export function team(projectId: string, id: string) {
  return {
    async get(): Promise<ApiResponse<PeopleTeamResponseBody>> {
      const endpointDetails = await endpoint(projectId, id);

      return api
        .atPath(endpointDetails.apiPath)
        .addHeader(`x-project: ${endpointDetails.projectId}`)
        .failOnError(false)
        .run() as Promise<ApiResponse<PeopleTeamResponseBody>>;
    },
  } as const;
}
export default teams;
