/*
::neup.documentation::logica-sites-object-api
::title Logica Sites Object API

Sites object facade for project-scoped member bridge helpers.

::public

Use `logica.sites(projectId).members.get()` to list project members.

Use `logica.sites(projectId).member(idOrSlug).get()` to fetch one member by id
or prefixed slug lookup.

::public end

::end
*/

import { requestSitesApi, type SitesApiResponse } from '@/logica/sites/api';

export interface SitesMemberDirectoryItem {
  id: string;
  displayName: string;
  position: string;
  displayImage: string | null;
  slug: string;
  socials: Array<{ platformName: string; url: string }>;
  description: string | null;
  moreDetails: unknown[];
  teamId: string | null;
  teamTitle: string | null;
  teamSlug: string | null;
  teamDescription: string | null;
}

export interface SitesMemberListResponseBody {
  success: boolean;
  data?: SitesMemberDirectoryItem[];
  error?: string;
}

export interface SitesMemberResponseBody {
  success: boolean;
  data?: SitesMemberDirectoryItem;
  error?: string;
}

export function sites(projectId: string) {
  return {
    members: {
      get(): Promise<SitesApiResponse<SitesMemberListResponseBody>> {
        return requestSitesApi<SitesMemberListResponseBody>({
          path: `/bridge/api.v1/project/${encodeURIComponent(projectId)}/team`,
        });
      },
    },

    member(idOrSlug: string) {
      return {
        get(): Promise<SitesApiResponse<SitesMemberResponseBody>> {
          return requestSitesApi<SitesMemberResponseBody>({
            path: `/bridge/api.v1/project/${encodeURIComponent(projectId)}/member/${encodeURIComponent(idOrSlug)}`,
          });
        },
      } as const;
    },
  } as const;
}

export type SitesScope = ReturnType<typeof sites>;

export { requestSitesApi };
export type { SitesApiResponse };

export default sites;
