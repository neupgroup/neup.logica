/*
::neup.documentation::logica-object-api
::title Logica Object API

Root object facade for Logica SDK modules.

::public

Use `logica.estate.*` to access estate API helpers.

::public end

::end
*/

import { estate } from '@/logica/estate';

export const logica = {
  estate,
} as const;

export { estate };

export default logica;
