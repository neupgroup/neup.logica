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
import { logger } from '@/logica/logger';

export const logica = {
  account,
  drive,
  estate,
  logger,
} as const;

export { account, drive, estate, logger };

export default logica;
