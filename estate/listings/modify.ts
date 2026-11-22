/*
::neup.documentation::logica-estate-listing-modify
::title Logica Estate Listing Modify Helper

Portable SDK helper for `PATCH /bridge/api.v1/listings/[slug]`.

::public

Submits listing edits as an awaiting-review request for the canonical `slug--id`
identifier in the path. Raw IDs and bare slugs are not accepted. Supply
`accountId` in the body unless the API request adds it as a header.

::public end

::end
*/

import { getBaseUrl } from '@neup/logica/baseurl';
import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import type { EstateListingRecord } from '@neup/logica/estate/types';

// External packages required by this logic module.
const requiredPackages = [] as const;


const LISTINGS_PATH = 'bridge/api.v1/listings';

export type ModifyEstateListingInput = {
  slug: string;
  accountId?: string | null;
  listing: EstateListingRecord;
};

export type ModifyEstateListingResponseBody = {
  success: boolean;
  requestId?: string;
  status?: 'awaiting review' | string;
  error?: string;
  desc?: string[];
};

export async function modifyEstateListing(
  input: ModifyEstateListingInput,
): Promise<ApiResponse<ModifyEstateListingResponseBody>> {
  return runApi<ModifyEstateListingResponseBody>({
    baseUrl: getBaseUrl('estate'),
    path: `${LISTINGS_PATH}/${encodeURIComponent(input.slug)}`,
    method: 'PATCH',
    body: {
      accountId: input.accountId,
      listing: input.listing,
    },
  });
}
