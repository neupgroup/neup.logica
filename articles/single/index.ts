/**
 * Fetch one article by its slug reference.
 *
 * Response example:
 *   status: 200
 *   headers: { "content-type": "application/json" }
 *   body: {
 *     "success": true,
 *     "data": {
 *       "slug": "my-article--UUID",
 *       "writtenAt": "2026-09-30T08:30:00.000Z",
 *       "writtenBy": "Author Name",
 *       "title": "My Article",
 *       "content": "<p>Article HTML content.</p>",
 *       "coverImageUrl": null,
 *       "metaDescription": "Article summary.",
 *       "language": "en",
 *       "tags": ["guide"]
 *     }
 *   }
 */
import { api, type ApiResponse } from '@neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { SitesArticle, SitesArticleResponseBody } from '../index';

export function article(projectId: string, reference: string) {
  return {
    async get(): Promise<ApiResponse<SitesArticleResponseBody>> {
      return api.atPath(url.web.path(getBaseUrl('sites')).addPath(`/bridge/api.v1/articles/${encodeURIComponent(reference)}`).get())
        .addHeader(`x-project: ${projectId}`).failOnError(false).run() as Promise<ApiResponse<SitesArticleResponseBody>>;
    },
  } as const;
}

export type ArticleSingleScope = ReturnType<typeof article>;
export type { SitesArticle };
export default article;
