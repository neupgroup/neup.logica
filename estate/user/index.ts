/*
::neup.documentation::logica-estate-user-object
::title Logica Estate User Object

Callable user scope for estate user-owned collections.

::public

Use `logica.estate.user(userId).*` for user-scoped estate collections.

::public end

::end
*/

import { requestEstateApi, type EstateApiResponse } from '#/logica/estate/api';

type ListKind = 'reaction' | 'save' | 'comment' | 'inquiry' | 'visit' | 'offer';

function list(kind: ListKind, query: Record<string, string>) {
  return requestEstateApi({
    path: `/bridge/api.v1/${kind}/list`,
    query,
  });
}

function createListScope(kind: ListKind, query: Record<string, string>) {
  return {
    list(): Promise<EstateApiResponse> {
      return list(kind, query);
    },
  } as const;
}

function createStatusListScope(kind: 'visit', query: Record<string, string>) {
  return {
    status(status: string) {
      return {
        list(): Promise<EstateApiResponse> {
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
    reaction: createListScope('reaction', query),
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
