/**
 * Article requests and responses for the project-scoped Articles API.
 *
 * ```ts
 * const response = await logica.articles(projectId).get();
 * const article = await logica.articles(projectId).article('slug--uuid').get();
 *
 * The collection request is equivalent to:
 *   curl https://example.com/bridge/api.v1/articles -H 'x-project: PROJECT_ID'
 *
 * Collection response:
 *   { "success": true, "data": [{ "slug": "my-article--UUID", "writtenAt": "2026-09-30T08:30:00.000Z", "writtenBy": "Author Name", "title": "My Article", "coverImageUrl": null, "metaDescription": "Article summary.", "language": "en", "tags": ["guide"] }] }
 *
 * Detail request:
 *   curl https://example.com/bridge/api.v1/articles/my-article--UUID -H 'x-project: PROJECT_ID'
 *
 * Detail response:
 *   { "success": true, "data": { "slug": "my-article--UUID", "writtenAt": "2026-09-30T08:30:00.000Z", "writtenBy": "Author Name", "title": "My Article", "coverImageUrl": null, "metaDescription": "Article summary.", "language": "en", "tags": ["guide"] } }
 * ```
 */
import { api, type ApiResponse } from '@neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';
import { article } from './single';

export interface SitesArticle {
  slug: string;
  writtenAt: string | null;
  writtenBy: string;
  title: string;
  coverImageUrl: string | null;
  metaDescription: string | null;
  language: string | null;
  tags: string[];
}

export interface SitesArticlesResponseBody { success: boolean; data?: SitesArticle[]; error?: string; }
export interface SitesArticleResponseBody { success: boolean; data?: SitesArticle; error?: string; }

function request(projectId: string, reference?: string) {
  const path = reference
    ? `/bridge/api.v1/articles/${encodeURIComponent(reference)}`
    : '/bridge/api.v1/articles';
  return api
    .atPath(url.web.path(getBaseUrl('sites')).addPath(path).get())
    .addHeader(`x-project: ${projectId}`)
    .failOnError(false);
}

export function articles(projectId: string) {
  return {
    async get(): Promise<ApiResponse<SitesArticlesResponseBody>> {
      return request(projectId).run() as Promise<ApiResponse<SitesArticlesResponseBody>>;
    },
    article: (reference: string) => article(projectId, reference),
  } as const;
}

export type ArticlesScope = ReturnType<typeof articles>;
export default articles;
