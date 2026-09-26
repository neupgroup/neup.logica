/**
 * Logica Sites careers API.
 *
 * Examples:
 *
 * ```ts
 * const response = await logica.sites(projectId).careers.get();
 * // response.body:
 * // { success: true, data: [{ id: 'career_123', title: 'Designer', status: 'Open' }] }
 *
 * const response = await logica.sites(projectId).career('career_123').get();
 * // response.body:
 * // { success: true, data: { id: 'career_123', title: 'Designer', status: 'Open' } }
 * ```
 *
 * The project ID is sent as the `x-project` header. Public requests return
 * only careers with an `Open` status.
 */
import { api, type ApiResponse } from '@neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';

export interface SitesCareer {
  id: string;
  projectId: string;
  title: string;
  location: string | null;
  type: string | null;
  description: string | null;
  status: string;
  qualifications: unknown;
  salary: string | null;
  openings: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SitesCareersResponseBody { success: boolean; data?: SitesCareer[]; error?: string }
export interface SitesCareerResponseBody { success: boolean; data?: SitesCareer; error?: string }

function endpoint(projectId: string, id?: string) {
  const baseUrl = getBaseUrl('sites');
  const path = id ? `/bridge/api.v1/careers/${id}` : `/bridge/api.v1/careers`;
  return { apiPath: url.web.path(baseUrl).addPath(path).get(), projectId };
}

export async function careers(projectId: string) {
  const endpointDetails = await endpoint(projectId);
  return api.atPath(endpointDetails.apiPath).addHeader(`x-project: ${endpointDetails.projectId}`).addHeader('Content-Type: application/json').failOnError(false).run() as Promise<ApiResponse<SitesCareersResponseBody>>;
}

export function career(projectId: string, id: string) {
  return {
    async get(): Promise<ApiResponse<SitesCareerResponseBody>> {
      const endpointDetails = await endpoint(projectId, id);
      return api.atPath(endpointDetails.apiPath).addHeader(`x-project: ${endpointDetails.projectId}`).addHeader('Content-Type: application/json').failOnError(false).run() as Promise<ApiResponse<SitesCareerResponseBody>>;
    },
  } as const;
}

export default careers;
