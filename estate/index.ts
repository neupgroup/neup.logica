/*
::neup.documentation::logica-estate-object-api
::title Logica Estate Object API

Estate object composed from nested estate domain folders.

::public

`logica.estate` is assembled from objects exported by child folders such as
`property`, `agent`, `agency`, and `inquiry`.

::public end

::end
*/

import { agency } from '@neup/logica/estate/agency';
import { agent } from '@neup/logica/estate/agent';
import { favorite } from '@neup/logica/estate/favorite';
import { inquiry } from '@neup/logica/estate/inquiry';
import { lead } from '@neup/logica/estate/lead';
import { offer } from '@neup/logica/estate/offer';
import { property } from '@neup/logica/estate/property';
import { reaction } from '@neup/logica/estate/reaction';
import { save } from '@neup/logica/estate/save';
import { comment } from '@neup/logica/estate/comment';
import { user } from '@neup/logica/estate/user';
import { visit } from '@neup/logica/estate/visit';
import { viewing } from '@neup/logica/estate/viewing';

export const estate = {
  property,
  agent,
  agency,
  inquiry,
  lead,
  favorite,
  viewing,
  offer,
  reaction,
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
  offer,
  property,
  reaction,
  save,
  user,
  visit,
  viewing,
};

export { requestEstateApi } from '@neup/logica/estate/api';
export type { EstateApiResponse } from '@neup/logica/estate/api';
export type {
  EstateInquiryCreateData,
  EstateObjectRecord,
  EstateOfferData,
  EstatePropertyCreateData,
  EstateViewingData,
} from '@neup/logica/estate/types';

export default estate;
