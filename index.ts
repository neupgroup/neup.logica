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

import { estate } from '@neup/logica/estate';
import { account } from '@neup/logica/account';
import { drive } from '@neup/logica/drive';
import { logger } from '@neup/logica/logger';
import { analytics } from '@neup/logica/analytics';
import { sites } from '@neup/logica/sites';
import { notification } from '@neup/logica/notification';

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
