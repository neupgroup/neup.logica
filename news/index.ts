/**
 * News requests and responses for the project-scoped News API.
 *
 * ```ts
 * const response = await logica.news(projectId).get();
 * const item = await logica.news(projectId).item('slug--uuid').get();
 *
 * Collection request:
 *   curl https://example.com/bridge/api.v1/news -H 'x-project: PROJECT_ID'
 * Collection response:
 *   { "success": true, "data": [{ "slug": "site-news--UUID", "writtenAt": "2026-09-30T08:30:00.000Z", "writtenBy": "Author Name", "title": "Site News", "coverImageUrl": null, "metaDescription": null, "language": null, "tags": [] }] }
 *
 * Detail request:
 *   curl https://example.com/bridge/api.v1/news/site-news--UUID -H 'x-project: PROJECT_ID'
 * Detail response:
 *   { "success": true, "data": { "slug": "site-news--UUID", "writtenAt": "2026-09-30T08:30:00.000Z", "writtenBy": "Author Name", "title": "Site News", "coverImageUrl": null, "metaDescription": null, "language": null, "tags": [] } }
 * ```
 */
import { api, type ApiResponse } from '@neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';
import { item } from './single';

export interface SitesNews {
  slug: string;
  writtenAt: string | null;
  writtenBy: string;
  title: string;
  coverImageUrl: string | null;
  metaDescription: string | null;
  language: string | null;
  tags: string[];
}

export interface SitesNewsResponseBody { success: boolean; data?: SitesNews[]; error?: string; }
export interface SitesNewsItemResponseBody { success: boolean; data?: SitesNews; error?: string; }

function request(projectId: string, reference?: string) {
  const path = reference
    ? `/bridge/api.v1/news/${encodeURIComponent(reference)}`
    : '/bridge/api.v1/news';
  return api
    .atPath(url.web.path(getBaseUrl('sites')).addPath(path).get())
    .addHeader(`x-project: ${projectId}`)
    .failOnError(false);
}

export function news(projectId: string) {
  return {
    async get(): Promise<ApiResponse<SitesNewsResponseBody>> {
      return request(projectId).run() as Promise<ApiResponse<SitesNewsResponseBody>>;
    },
    item: (reference: string) => item(projectId, reference),
  } as const;
}

export type NewsScope = ReturnType<typeof news>;
export default news;
