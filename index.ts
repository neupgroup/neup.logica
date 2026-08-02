/*
::neup.documentation::logica-object-api
::title Logica Object API

Root object facade for Logica SDK modules.

::public

Use `logica.account.*` for account bridge helpers and `logica.estate.*` to
access estate API helpers.

::public end

::end
*/

import { estate } from '@/logica/estate';
import { account } from '@/logica/account';

export const logica = {
  account,
  estate,
} as const;

export { account, estate };

export default logica;
