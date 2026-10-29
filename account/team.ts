/*
::neup.documentation::logica-account-team-module
::title Logica Team Route Helpers

Portable wrapper for bridge team-member routes.

::public

Use this module when you need team members for either an application (`/bridge/api.v1/access/team`) or a connection (`/bridge/api.v1/access/connection`).

::public end

::end
*/


import { runApi } from '@neup/core/infrastructure/api';
import type { ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import { getApplicationTeamMembers, getConnectionTeamMembers } from '@neup/logica/account/access';


const Basepath = 'bridge/api.v1';
const MembersEndpoint = `${Basepath}/members`;
const MembersTeamEndpoint = `${Basepath}/members/team`;

type TeamAuth = {
  authAccountToken?: string | null;
  authTokenHeader?: string | null;
};

/*
::neup.documentation::logica-account-get-team-members-input-type
::type GetTeamMembersInput

Input for the unified team-member helper.

::public

Accepts either a connection id or application id plus optional profile and auth
headers.

::public end

::end
*/
export type GetTeamMembersInput = TeamAuth & {
  app?: string;
  application?: string;
  connection?: string;
  profile?: string;
};

/**
 * ::neup.documentation::logica-account-team-get-team-members
 * ::function getTeamMembers(input)
 *
 * Returns team-member data for either one application or one connection.
 *
 * ::public
 *
 * Pass `connection` to read `/bridge/api.v1/access/connection`, or pass `app` / `application` to read `/bridge/api.v1/access/team`.
 *
 * ::public end
 *
 * ::private
 *
 * The helper rejects ambiguous calls where both `connection` and `app` / `application` are provided because the bridge endpoints return different payload shapes.
 *
 * ::private end
 *
 * ::end
 */
export async function getTeamMembers(
  input: GetTeamMembersInput,
): Promise<ApiResponse> {
  const connection = input.connection?.trim();
  const app = input.app?.trim() || input.application?.trim();

  if (connection && app) {
    throw new Error('Provide either `connection` or `app`/`application`, not both.');
  }

  if (connection) {
    return getConnectionTeamMembers({
      connection,
      profile: input.profile,
      authAccountToken: input.authAccountToken,
      authTokenHeader: input.authTokenHeader,
    });
  }

  if (app) {
    return getApplicationTeamMembers({
      app,
      profile: input.profile,
      authAccountToken: input.authAccountToken,
      authTokenHeader: input.authTokenHeader,
    });
  }

  throw new Error('`connection` or `app`/`application` is required.');
}

/** Reads all organization members from GET /bridge/api.v1/members. */
export async function getMembers(
  input: TeamAuth = {},
): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('neupid'),
    path: MembersEndpoint,
    method: 'GET',
    cookies: { auth_account: input.authAccountToken },
    bearerToken: input.authTokenHeader,
  });
}

/** Reads one organization member from GET /bridge/api.v1/members/[id]. */
export async function getMember(
  id: string,
  input: TeamAuth = {},
): Promise<ApiResponse> {
  const memberId = id.trim();
  if (!memberId) throw new Error('`id` is required.');
  return runApi({
    baseUrl: getBaseUrl('neupid'),
    path: `${Basepath}/members/${encodeURIComponent(memberId)}`,
    method: 'GET',
    cookies: { auth_account: input.authAccountToken },
    bearerToken: input.authTokenHeader,
  });
}

/** Reads all organization teams from GET /bridge/api.v1/members/team. */
export async function getTeams(
  input: TeamAuth = {},
): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('neupid'),
    path: MembersTeamEndpoint,
    method: 'GET',
    cookies: { auth_account: input.authAccountToken },
    bearerToken: input.authTokenHeader,
  });
}

/** Reads one organization team from GET /bridge/api.v1/members/team/[id]. */
export async function getTeam(
  id: string,
  input: TeamAuth = {},
): Promise<ApiResponse> {
  const teamId = id.trim();
  if (!teamId) throw new Error('`id` is required.');
  return runApi({
    baseUrl: getBaseUrl('neupid'),
    path: `${Basepath}/members/team/${encodeURIComponent(teamId)}`,
    method: 'GET',
    cookies: { auth_account: input.authAccountToken },
    bearerToken: input.authTokenHeader,
  });
}
