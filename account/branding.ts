/*
::neup.documentation::logica-account-branding-module
::title Logica Branding Route Helpers

Portable wrappers for bridge branding routes.

::public

Use this module for `/bridge/api.v1/branding/logo`.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';


const Basepath = 'bridge/api.v1';
const BrandingLogoEndpoint = `${Basepath}/branding/logo`;

/*
::neup.documentation::logica-account-get-application-logo-function
::function getApplicationLogo()

Fetches the configured application logo.

::public

Calls the account bridge branding logo route.

::public end

::end
*/
export async function getApplicationLogo(): Promise<ApiResponse> {
  return runApi({
    baseUrl: getBaseUrl('neupid'),
    path: BrandingLogoEndpoint,
    method: 'GET',
  });
}
