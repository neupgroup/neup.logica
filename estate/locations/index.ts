/*
::neup.documentation::logica-estate-locations-object
::title Logica Estate Locations Object

Read-only location collection API for the estate SDK.

::public

Use `logica.estate.locations.list()` to retrieve locations. Optional `query`,
`id`, `type`, and `status` filters are supported, with `limit` and `offset`
for pagination. The API defaults to 50 locations per page and caps pages at
100 locations.

::public end

::end
*/

import { runApi, type ApiResponse } from '@neup/core/infrastructure/api';
import { getBaseUrl } from '@neup/logica/baseurl';

const LocationsEndpoint = 'https://neupgroup.com/estate/bridge/api.v1/locations';

export type EstateLocation = {
  id: string;
  title: string;
  type: string;
  childOf: string | null;
  postalCode: string | null;
  status: string;
  parent: { id: string; title: string; type: string } | null;
};

export type EstateLocationsListInput = {
  id?: string;
  type?: string;
  status?: string;
  query?: string;
  limit?: number;
  offset?: number;
};

export type EstateLocationsListResponseBody = {
  data: EstateLocation[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  success?: boolean;
  error?: string;
};

// Requests the read-only location collection from the estate API.
function list(input: EstateLocationsListInput = {}): Promise<ApiResponse<EstateLocationsListResponseBody>> {
  const query = Object.fromEntries(
    Object.entries(input)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  );

  return runApi<EstateLocationsListResponseBody>({
    baseUrl: getBaseUrl('estate'),
    path: LocationsEndpoint,
    query,
  });
}

export const locations = { list } as const;

export type EstateLocations = typeof locations;

export default locations;
