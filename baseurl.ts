// Define the base URLs.
const baseUrls = {
  'analytics': 'https://neupgroup.com/analytics',
  'cloud': 'https://neupgroup.com/cloud',
  'sites': 'https://neupgroup.com/sites',
  'estate': 'https://neupgroup.com/estate',
  'neupid': 'https://neupgroup.com/account',
  'drive': 'https://neupgroup.com/drive',
  'neup.analytics': 'https://neupgroup.com/analytics',
  'neup.cloud': 'https://neupgroup.com/cloud',
  'neup.sites': 'https://neupgroup.com/sites',
  'neup.estate': 'https://neupgroup.com/estate',
  'neup.neupid': 'https://neupgroup.com/account',
  'neup.drive': 'https://neupgroup.com/drive'
} as const;



// Define the type for the logica App names.
export type LogicaAppName = keyof typeof baseUrls;




// Get the base URL for a given Logica App name.
export function getBaseUrl(appname: LogicaAppName): string {
  if (!baseUrls[appname]) {
    throw new Error(`Invalid app name: ${appname}`);
  }
  return baseUrls[appname];
}
