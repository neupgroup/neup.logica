/*
::neup.documentation::logica-estate-user-object
::title Logica Estate User Object

Callable user scope for estate user-owned collections.

::public

Use `logica.estate.user(userId).*` for user-scoped estate collections.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';


/** Builds the API endpoint for userlist. */
const getUserListEndpoint = (kind: string) => `https://neupgroup.com/estate/bridge/api.v1/${kind}/list`;

type ListKind = 'save' | 'comment' | 'inquiry' | 'visit' | 'offer';

function list(kind: ListKind, query: Record<string, string>) {
  return runApi({
    baseUrl: getBaseUrl('estate'),
    path: getUserListEndpoint(kind),
    query,
  });
}

function createListScope(kind: ListKind, query: Record<string, string>) {
  return {
    list(): Promise<ApiResponse> {
      return list(kind, query);
    },
  } as const;
}

function createStatusListScope(kind: 'visit', query: Record<string, string>) {
  return {
    status(status: string) {
      return {
        list(): Promise<ApiResponse> {
          return list(kind, { ...query, status });
        },
      } as const;
    },
  } as const;
}

function createUserAgencyScope(userId: string) {
  return function agency(agencyId: string) {
    const query = { userId, agencyId };
    return {
      offer: createListScope('offer', query),
    } as const;
  };
}

function createUserAgentScope(userId: string) {
  return function agent(agentId: string) {
    const query = { userId, agentId };
    return {
      offer: createListScope('offer', query),
    } as const;
  };
}

function createUserPropertyScope(userId: string) {
  return function property(propertyId: string) {
    const query = { userId, propertyId };
    return {
      offer: createListScope('offer', query),
    } as const;
  };
}

export function user(userId: string) {
  const query = { userId };
  return {
    save: createListScope('save', query),
    comment: createListScope('comment', query),
    inquiry: createListScope('inquiry', query),
    visit: createStatusListScope('visit', query),
    offer: createListScope('offer', query),
    agency: createUserAgencyScope(userId),
    agent: createUserAgentScope(userId),
    property: createUserPropertyScope(userId),
  } as const;
}

export default user;
