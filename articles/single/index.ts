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
