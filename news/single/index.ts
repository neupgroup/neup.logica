import { api, type ApiResponse } from '@neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { SitesNews, SitesNewsItemResponseBody } from '../index';

export function item(projectId: string, reference: string) {
  return {
    async get(): Promise<ApiResponse<SitesNewsItemResponseBody>> {
      return api.atPath(url.web.path(getBaseUrl('sites')).addPath(`/bridge/api.v1/news/${encodeURIComponent(reference)}`).get())
        .addHeader(`x-project: ${projectId}`).failOnError(false).run() as Promise<ApiResponse<SitesNewsItemResponseBody>>;
    },
  } as const;
}

export type NewsSingleScope = ReturnType<typeof item>;
export type { SitesNews };
export default item;
