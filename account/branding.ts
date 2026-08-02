/*
::neup.documentation::logica-account-branding-module
::title Logica Branding Route Helpers

Portable wrappers for bridge branding routes.

::public

Use this module for `/bridge/api.v1/branding/logo`.

::public end

::end
*/

import { runNeupBridgeApi, type NeupBridgeResponse } from '@/logica/account/api';

/*
::neup.documentation::logica-account-get-application-logo-function
::function getApplicationLogo()

Fetches the configured application logo.

::public

Calls the account bridge branding logo route.

::public end

::end
*/
export async function getApplicationLogo(): Promise<NeupBridgeResponse> {
  return runNeupBridgeApi({
    path: '/bridge/api.v1/branding/logo',
    method: 'GET',
  });
}
