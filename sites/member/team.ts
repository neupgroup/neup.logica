import { api, type ApiResponse } from '@/.neup/core/infrastructure/api';
import { url } from '@neup/core/helpers/url';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { SitesMemberDirectoryItem } from '@neup/logica/sites';

export interface SitesMemberListResponseBody {
  success: boolean;
  data?: SitesMemberDirectoryItem[];
  error?: string;
}

export function team(projectId: string) {
  return {
    get(): Promise<ApiResponse<SitesMemberListResponseBody>> {
      // Get the base URL for the Sites application.
      const baseUrl = getBaseUrl('sites');
      // Build the version 1 API path for the Sites team endpoint.
      const path = url.web.path(baseUrl)
        .addPath('bridge/api.v1/project')
        .addPath(projectId)
        .addPath('team')
        .get();
      // Execute the request through the shared API runner.
      return api.atPath(path).run().run().then((runner) => runner.getResponse<SitesMemberListResponseBody>());
    },
  } as const;
}

export default team;
