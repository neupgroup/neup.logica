/*
::neup.documentation::logica-account-access-module
::title Logica Access Route Helpers

Portable wrappers for bridge access and application-team routes.

::public

Use this module for `/bridge/api.v1/access/connection` and `/bridge/api.v1/access/team`.

::public end

::end
*/

import { runNeupBridgeApi, type NeupBridgeResponse } from '@/logica/neupid/api';

type AccessAuth = {
  authAccountToken?: string | null;
  authTokenHeader?: string | null;
};

function buildAccessHeaders(input: AccessAuth): HeadersInit | undefined {
  if (!input.authTokenHeader?.trim()) return undefined;
  return { auth: input.authTokenHeader.trim() };
}

export async function getConnectionTeamMembers(input: AccessAuth & {
  connection: string;
  profile?: string;
}): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/access/connection',
    method: 'GET',
    query: {
      connection: input.connection,
      profile: input.profile,
    },
    authAccountToken: input.authAccountToken,
    headers: buildAccessHeaders(input),
  });
}

export async function getConnectionTeamMemberAccess(input: AccessAuth & {
  connection: string;
  profile?: string;
}): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/access/connection',
    method: 'POST',
    body: {
      connection: input.connection,
      profile: input.profile,
    },
    authAccountToken: input.authAccountToken,
    headers: buildAccessHeaders(input),
  });
}

export async function getApplicationTeamMembers(input: AccessAuth & {
  app: string;
  profile?: string;
}): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/access/team',
    method: 'GET',
    query: {
      app: input.app,
      profile: input.profile,
    },
    authAccountToken: input.authAccountToken,
    headers: buildAccessHeaders(input),
  });
}

export async function getApplicationTeamMemberAccess(input: AccessAuth & {
  app: string;
  profile?: string;
}): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/access/team',
    method: 'POST',
    body: {
      app: input.app,
      profile: input.profile,
    },
    authAccountToken: input.authAccountToken,
    headers: buildAccessHeaders(input),
  });
}
