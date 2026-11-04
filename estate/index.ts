/*
::neup.documentation::logica-estate-object-api
::title Logica Estate Object API

Estate object composed from nested estate domain folders.

::public

`logica.estate` is assembled from objects exported by child folders such as
`listings`, `profile`, `agent`, `agency`, and `inquiry`.

::public end

::end
*/

import { agency } from '@neup/logica/estate/agency';
import { agent } from '@neup/logica/estate/agent';
import { favorite } from '@neup/logica/estate/favorite';
import { inquiry } from '@neup/logica/estate/inquiry';
import { lead } from '@neup/logica/estate/lead';
import { locations } from '@neup/logica/estate/locations';
import { requirement } from '@neup/logica/estate/requirement';
import { offer } from '@neup/logica/estate/offer';
import { listings } from '@neup/logica/estate/listings';
import { profile } from '@neup/logica/estate/profile';
import { save } from '@neup/logica/estate/save';
import { comment } from '@neup/logica/estate/comment';
import { user } from '@neup/logica/estate/user';
import { visit } from '@neup/logica/estate/visit';
import { viewing } from '@neup/logica/estate/viewing';

// External packages required by this logic module.
const requiredPackages = [] as const;


export const estate = {
  listings,
  profile,
  agent,
  agency,
  inquiry,
  lead,
  locations,
  requirement,
  favorite,
  viewing,
  offer,
  save,
  comment,
  user,
  visit,
} as const;

export {
  agency,
  agent,
  comment,
  favorite,
  inquiry,
  lead,
  locations,
  offer,
  listings,
  profile,
  requirement,
  save,
  user,
  visit,
  viewing,
};

export {
  getListingsByAccount,
  getListingsListed,
  getListingsSaved,
  getListingsOwned,
  getListingsBeingWorked,
} from '@neup/logica/estate/listings';
export {
  getProfileById,
  listProfiles,
} from '@neup/logica/estate/profile';
export type { EstateSaveCreateData } from '@neup/logica/estate/save';
export type {
  EstateSavedListingsListOptions,
  EstateSavedListingRemoval,
  EstateAccountListingListResponseBody,
} from '@neup/logica/estate/listings';
export type {
  EstateAccountAgency,
  EstateAccountProfile,
  EstateAccountProfileResponseBody,
  EstateProfileListInput,
  EstateProfileListResponseBody,
  EstateProfileScope,
  EstateProfileSummary,
  EstateProfileType,
} from '@neup/logica/estate/profile';
export type {
  EstateInquiryCreateData,
  EstateObjectRecord,
  EstateOfferData,
  EstateListingCreateData,
  EstateRequirementData,
  EstateViewingData,
} from '@neup/logica/estate/types';

export default estate;
