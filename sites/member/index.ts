import { api, type ApiResponse } from '@neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { SitesMemberDirectoryItem, SitesMemberListResponseBody } from '@neup/logica/sites';

/**
 * Response returned by the Sites member endpoint.
 *
 * {
 *   success: boolean;
 *   members: SitesMemberDirectoryItem[];
 * }
 */
export interface SitesMemberResponseBody {
  success: boolean;
  members?: SitesMemberDirectoryItem[];
  error?: string;
}

/**
 * Structure of an individual member in `response.body.members`.
 *
 * {
 *   id: string;
 *   assetId: string | null;
 *   slug: string;
 *   name: string;
 *   email: string | null;
 *   role: string;
 *   status: string;
 *   order: number;
 * }
 */
export type SitesIndividualMember = SitesMemberDirectoryItem;

/**
 * Fetches the Sites project member directory.
 *
 * The endpoint returns the active member records for the selected project in
 * `response.body.members`. The optional `idOrSlug` parameter is reserved for
 * fetching an individual member and is currently accepted for compatibility
 * with the Sites facade.
 *
 * @param projectId - The Sites project identifier sent in the `x-project`
 *   request header.
 * @param idOrSlug - Optional member identifier or slug.
 * @returns A promise containing the API response and member records.
 *
 * @example
 * ```ts
 * const response = await member(projectId);
 * const members = response.body.members ?? [];
 * ```
 */
export async function member(projectId: string, idOrSlug?: string) {
  // Get the path for the Sites.
  const baseUrl = getBaseUrl('sites');

  // Define the API path for the Sites members endpoint.
  const apiPath = await url.web.path(baseUrl)
  .addPath('/bridge/api.v1/members').get();

  // Now run the API request using the defined path and headers.
  const apiResponse = await api.atPath(apiPath)
  .addHeader("x-project: " + projectId)
  .addHeader("Content-Type: application/json")
  .failOnError(false)
  .run();
  
  // Return the API response as a promise.
  return apiResponse as ApiResponse<SitesMemberResponseBody>;
}

export default member;
