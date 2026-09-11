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

    member(idOrSlug: string) {
      return member(resolvedProjectId, idOrSlug);
    },
  } as const;
}

export type SitesScope = ReturnType<typeof sites>;

export type { SitesMemberListResponseBody, SitesMemberResponseBody };

export default sites;
