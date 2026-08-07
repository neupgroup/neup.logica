/*
::neup.documentation::logica-object-api
::title Logica Object API

Root object facade for Logica SDK modules.

::public

Use `logica.account.*` for account bridge helpers, `logica.drive.*` for drive
helpers, and `logica.estate.*` to access estate API helpers.

::public end

::end
*/

import { estate } from '@/logica/estate';
import { account } from '@/logica/account';
import { drive } from '@/logica/drive';

export const logica = {
  account,
  drive,
  estate,
} as const;

export { account, drive, estate };

export default logica;
