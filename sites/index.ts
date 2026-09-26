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

import { getEnvVariable } from '@neup/core/helpers/env';
import { member, type SitesMemberResponseBody } from '@neup/logica/sites/member';
import { team, type SitesMemberListResponseBody } from '@neup/logica/sites/member/team';
import { careers, career, type SitesCareerResponseBody, type SitesCareersResponseBody } from '@neup/logica/sites/careers';

export interface SitesMemberDirectoryItem {
  id: string;
  assetId: string | null;
  slug: string;
  name: string;
  email: string | null;
  role: string;
  status: string;
  order: number;
}

function resolveProjectId(projectId?: string): string {
  const resolvedProjectId = projectId?.trim() || getEnvVariable('NEUPSITE_PROJECT_ID', true);

  if (!resolvedProjectId) {
    throw new Error('NEUPSITE_PROJECT_ID is required to use logica.sites().');
  }

  return resolvedProjectId;
}

export function sites(projectId?: string) {
  const resolvedProjectId = resolveProjectId(projectId);

  return {
    members: {
      get: () => team(resolvedProjectId).get(),
    },

    careers: {
      get: () => careers(resolvedProjectId),
    },

    member(idOrSlug: string) {
      return member(resolvedProjectId, idOrSlug);
    },

    career(id: string) {
      return career(resolvedProjectId, id);
    },
  } as const;
}

export type SitesScope = ReturnType<typeof sites>;

export type { SitesMemberListResponseBody, SitesMemberResponseBody };
export type { SitesCareerResponseBody, SitesCareersResponseBody };

export default sites;
