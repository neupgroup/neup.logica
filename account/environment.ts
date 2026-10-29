import { getEnvVariable } from '@neup/core/helpers/env';
import { getBaseUrl } from '@neup/logica/baseurl';

export type NeupBridgeEnvironment = {
  appId: string;
  appSecret: string;
  authUrl: string;
};

/** Reads a required bridge credential from the app runtime environment. */
function requireEnv(name: 'NEUP_APP_ID' | 'NEUP_APP_SECRET'): string {
  const value = getEnvVariable(name) || process.env[name.toLowerCase()]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

/** Returns configured credentials and the NeupID bridge base URL. */
export function getNeupBridgeEnvironment(): NeupBridgeEnvironment {
  return {
    appId: requireEnv('NEUP_APP_ID'),
    appSecret: requireEnv('NEUP_APP_SECRET'),
    authUrl: getBaseUrl('neupid'),
  };
}
