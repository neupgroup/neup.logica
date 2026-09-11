import { api, type ApiResponse } from '@/.neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { SitesMemberDirectoryItem } from '@neup/logica/sites';

export interface SitesMemberResponseBody {
  success: boolean;
  data?: SitesMemberDirectoryItem;
  error?: string;
}

export function member(projectId: string, idOrSlug: string) {
  return {
    get(): Promise<ApiResponse<SitesMemberResponseBody>> {
      // Get the path for the Sites.
      const baseUrl = getBaseUrl('sites');
      // Define the version 1 API path for the Sites member endpoint.
      const path = url.web.path(baseUrl)
        .addPath('bridge/api.v1/project')
        .addPath(projectId)
        .addPath('member')
        .addPath(idOrSlug)
        .get();
      // Lets log the url for debugging purposes.
      console.log(`Requesting member data from: ${path}`);
      // Execute the request through the shared API runner.
      return api.atPath(path).run().run().then((runner) => runner.getResponse<SitesMemberResponseBody>());
    },
  } as const;
}

export default member;
