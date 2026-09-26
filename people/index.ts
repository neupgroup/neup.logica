/**
 * People facade examples.
 *
 * ```ts
 * const people = logica.people(projectId);
 * const careers = await people.careers.get();
 * const members = await people.members.get();
 * const team = await people.team('team_123').get();
 * ```
 *
 * Each response exposes `success`. Successful collection/detail responses
 * use `data`; failures use `error`.
 */
import { getEnvVariable } from '@neup/core/helpers/env';
import {
  careers,
  career,
  type SitesCareerResponseBody,
  type SitesCareersResponseBody,
} from '@neup/logica/people/careers';
import { members, member, type PeopleMemberResponseBody } from '@neup/logica/people/members';
import { teams, team, type PeopleTeamResponseBody } from '@neup/logica/people/teams';

function resolveProjectId(projectId?: string) {
  const resolved = projectId?.trim() || getEnvVariable('NEUP_SITES_PROJECT_ID', true);
  if (!resolved) {
    throw new Error('NEUP_SITES_PROJECT_ID is required to use logica.people().');
  }
  return resolved;
}

export function people(projectId?: string) {
  const resolvedProjectId = resolveProjectId(projectId);
  return {
    careers: {
      get: () => careers(resolvedProjectId),
    },
    career: (id: string) => career(resolvedProjectId, id),
    members: { get: () => members(resolvedProjectId) },
    member: (id: string) => member(resolvedProjectId, id),
    teams: { get: () => teams(resolvedProjectId) },
    team: (id: string) => team(resolvedProjectId, id),
  } as const;
}

export type PeopleScope = ReturnType<typeof people>;
export type {
  SitesCareerResponseBody,
  SitesCareersResponseBody,
  PeopleMemberResponseBody,
  PeopleTeamResponseBody,
};
export default people;
