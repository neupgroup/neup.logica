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

import { logger } from '@neup/logica/logger';
import { analytics } from '@neup/logica/analytics';
import { sites } from '@neup/logica/sites';

export const logica = {
  analytics,
  logger,
  sites,
} as const;

export { analytics, logger, sites };

export default logica;
