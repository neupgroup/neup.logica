/**
 * Members requests and responses.
 *
 * ```ts
 * const response = await logica.people(projectId).members.get();
 * // Success: { success: true, members: [{ id: 'member_123', name: 'Alex', role: 'Designer' }] }
 * // Error:   { success: false, error: 'Unable to load members right now.' }
 *
 * const response = await logica.people(projectId).member('member_123').get();
 * // Success: { success: true, member: { id: 'member_123', name: 'Alex', role: 'Designer' } }
 * // Error:   { success: false, error: 'Member not found.' }
 * ```
 *
 * The project ID is sent as the `x-project` header.
 */
import { api, type ApiResponse } from '@neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';

export interface PeopleMember {
  id: string;
  assetId: string | null;
  slug: string;
  name: string;
  email: string | null;
  role: string;
  status: string;
  order: number;
}

export interface PeopleMemberResponseBody {
  success: boolean;
  data?: PeopleMember[] | PeopleMember;
  error?: string;
}

function endpoint(projectId: string, id?: string) {
  const baseUrl = getBaseUrl('sites');
  const path = id ? `/bridge/api.v1/members/${id}` : '/bridge/api.v1/members';

  return {
    apiPath: url.web.path(baseUrl).addPath(path).get(),
    projectId,
  };
}

export async function members(projectId: string) {
  const endpointDetails = await endpoint(projectId);

  return api
    .atPath(endpointDetails.apiPath)
    .addHeader(`x-project: ${endpointDetails.projectId}`)
    .failOnError(false)
    .run() as Promise<ApiResponse<PeopleMemberResponseBody>>;
}

export function member(projectId: string, id: string) {
  return {
    async get(): Promise<ApiResponse<PeopleMemberResponseBody>> {
      const endpointDetails = await endpoint(projectId, id);

      return api
        .atPath(endpointDetails.apiPath)
        .addHeader(`x-project: ${endpointDetails.projectId}`)
        .failOnError(false)
        .run() as Promise<ApiResponse<PeopleMemberResponseBody>>;
    },
  } as const;
}
export default members;
