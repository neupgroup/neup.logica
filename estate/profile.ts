/*
::neup.documentation::logica-estate-profile
::title Logica Estate Account Profiles

Typed access to the public account list and profile endpoints used by estate
agent and agency pages.

::public

Use `logica.estate.profile.list({ type, offset, limit })` to browse profiles,
or `logica.estate.profile(accountId).get()` to load a full account profile.

::public end
::end
*/
import { requestEstateApi, type EstateApiResponse } from '@neup/logica/estate/api';

export type EstateProfileType = 'independentAgent' | 'agency' | 'companyAgent';

export type EstateProfileSummary = {
  id: string;
  type: string;
  name: string;
  image: string | null;
  neupid: string | null;
};

export type EstateAccountProfile = {
  id: string;
  type: string;
  name: string;
  image: string | null;
  cover: string | null;
  neupid: string | null;
  bio: string | null;
  isVerified: boolean;
};

export type EstateAccountAgency = {
  id: string;
  name: string;
  image: string | null;
  neupid: string | null;
  isPrimary: boolean;
};

export type EstateAccountProfileResponseBody = {
  success: true;
  profile: EstateAccountProfile;
  agencies: EstateAccountAgency[];
  properties: { count: number };
} | {
  success: false;
  error: string;
};

export type EstateProfileListResponseBody = {
  success: true;
  accounts: EstateProfileSummary[];
  pagination: { limit: number; offset: number; total: number; hasMore: boolean };
} | {
  success: false;
  error: string;
};

export type EstateProfileListInput = {
  type: EstateProfileType;
  offset?: number;
  limit?: number;
};

export function getProfileById(accountId: string) {
  return requestEstateApi<EstateAccountProfileResponseBody>({
    path: `/bridge/api.v1/accounts/${encodeURIComponent(accountId)}`,
  });
}

export function listProfiles(input: EstateProfileListInput) {
  return requestEstateApi<EstateProfileListResponseBody>({
    path: '/bridge/api.v1/accounts',
    query: {
      type: input.type,
      offset: input.offset ?? 0,
      limit: input.limit ?? 10,
    },
  });
}

export function profile(accountId: string) {
  return {
    get(): Promise<EstateApiResponse<EstateAccountProfileResponseBody>> {
      return getProfileById(accountId);
    },
  } as const;
}

profile.list = listProfiles;
profile.getById = getProfileById;

export type EstateProfileScope = ReturnType<typeof profile>;

export default profile;
