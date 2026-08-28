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

import { estate } from '#/logica/estate';
import { account } from '#/logica/account';
import { drive } from '#/logica/drive';
import { logger } from '#/logica/logger';
import { analytics } from '#/logica/analytics';
import { sites } from '#/logica/sites';
import { notification } from '#/logica/notification';

export const logica = {
  account,
  analytics,
  drive,
  estate,
  logger,
  sites,
  notification,
} as const;

export { account, analytics, drive, estate, logger, sites, notification };

export default logica;
