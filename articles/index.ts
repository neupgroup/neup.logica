/**
 * Article requests and responses for the project-scoped Articles API.
 *
 * ```ts
 * const response = await logica.articles(projectId).get();
 * const article = await logica.articles(projectId).article('slug--uuid').get();
 * ```
 */
import { api, type ApiResponse } from '@neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';

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
    article(reference: string) {
      return {
        async get(): Promise<ApiResponse<SitesArticleResponseBody>> {
          return request(projectId, reference).run() as Promise<ApiResponse<SitesArticleResponseBody>>;
        },
      } as const;
    },
  } as const;
}

export type ArticlesScope = ReturnType<typeof articles>;
export default articles;
