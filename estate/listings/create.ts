/*
::neup.documentation::logica-estate-listing-create
::title Logica Estate Listing Create Helper

Portable SDK helper for `POST /bridge/api.v1/listings`.

::public

Submits a listing creation payload as an awaiting-review draft.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';
import type { EstateListingRecord } from '@neup/logica/estate/types';

// External packages required by this logic module.
const requiredPackages = [] as const;


const ListingsPath = 'bridge/api.v1/listings';

export type CreateEstateListingInput = {
  accountId: string;
  listing: EstateListingRecord;
  postingAgencyId?: string | null;
  workingProfileId?: string | null;
};

export type CreateEstateListingResponseBody = {
  success: boolean;
  requestId?: string;
  status?: 'awaiting review' | string;
  error?: string;
  desc?: string[];
};

export async function createEstateListing(
  input: CreateEstateListingInput,
): Promise<ApiResponse<CreateEstateListingResponseBody>> {
  return runApi<CreateEstateListingResponseBody>({
    baseUrl: getBaseUrl('estate'),
    path: ListingsPath,
    method: 'POST',
    body: {
      accountId: input.accountId,
      postingAgencyId: input.postingAgencyId,
      workingProfileId: input.workingProfileId,
      listing: input.listing,
    },
  });
}
