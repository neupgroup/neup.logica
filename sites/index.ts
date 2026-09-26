/*
::neup.documentation::logica-sites-object-api
::title Logica Sites Object API

Sites object facade for project-scoped site helpers.

::public

People resources are available through `logica.people(projectId)`.

::public end

::end
*/

import { getEnvVariable } from '@neup/core/helpers/env';
import { people } from '@neup/logica/people';

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
  const resolvedProjectId = projectId?.trim() || getEnvVariable('NEUP_SITES_PROJECT_ID', true);

  if (!resolvedProjectId) {
    throw new Error('NEUP_SITES_PROJECT_ID is required to use logica.sites().');
  }

  return resolvedProjectId;
}

export function sites(projectId?: string) {
  const resolvedProjectId = resolveProjectId(projectId);

  return {
    people: people(resolvedProjectId),
  } as const;
}

export type SitesScope = ReturnType<typeof sites>;

export default sites;
