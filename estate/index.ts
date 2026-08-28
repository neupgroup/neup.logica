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

import { agency } from '#/logica/estate/agency';
import { agent } from '#/logica/estate/agent';
import { favorite } from '#/logica/estate/favorite';
import { inquiry } from '#/logica/estate/inquiry';
import { lead } from '#/logica/estate/lead';
import { offer } from '#/logica/estate/offer';
import { property } from '#/logica/estate/property';
import { reaction } from '#/logica/estate/reaction';
import { save } from '#/logica/estate/save';
import { comment } from '#/logica/estate/comment';
import { user } from '#/logica/estate/user';
import { visit } from '#/logica/estate/visit';
import { viewing } from '#/logica/estate/viewing';

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

export { requestEstateApi } from '#/logica/estate/api';
export type { EstateApiResponse } from '#/logica/estate/api';
export type {
  EstateInquiryCreateData,
  EstateObjectRecord,
  EstateOfferData,
  EstatePropertyCreateData,
  EstateViewingData,
} from '#/logica/estate/types';

export default estate;
