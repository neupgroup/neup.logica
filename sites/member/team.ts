import type { ApiResponse } from '@neup/core/infrastructure/api';
import { member } from '@neup/logica/sites/member';
import type { SitesMemberDirectoryItem } from '@neup/logica/sites';

export interface SitesMemberListResponseBody {
  success: boolean;
  members?: SitesMemberDirectoryItem[];
  error?: string;
}

export function team(projectId: string) {
  return {
    get(): Promise<ApiResponse<SitesMemberListResponseBody>> {
      return member(projectId).then((response) => response as ApiResponse<SitesMemberListResponseBody>);
    },
  } as const;
}

export default team;
