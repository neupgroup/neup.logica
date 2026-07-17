/*
::neup.documentation::logica-account-connections-permissions-module
::title Logica Connections Permission Helper

Portable wrapper for checking whether one application user has a permission for an account.

::public

Use `hasPermission(permissionName, forApplicationID, forAccount, byAccount, options)` to fetch `byAccount` from the bridge and verify whether that user has `permissionName` for `forAccount`.

::public end

::private

The helper reads `/bridge/api.v1/accounts/lookup`, which returns the permission snapshot for one application user/connection. `appSecret` is required by the bridge API and can be passed in options.

::private end

::end
*/

import baseJson from '@/logica/neupid/base.json';
import type { NeupBridgeResponse } from '@/logica/core/api-runner';

type AccountAccessEntry = {
  accessOf: string | null;
  role: string | null;
  permissions: string[];
};

type AccountLookupResponseBody = {
  success?: boolean;
  access?: AccountAccessEntry[];
  error?: string;
  reason?: string;
};

export type HasPermissionOptions = {
  appSecret?: string | null;
  headers?: HeadersInit;
};

export type HasPermissionResponseBody = {
  success: boolean;
  allowed: boolean;
  permissionName: string;
  forApplicationID: string;
  forAccount: string;
  byAccount: string;
  access: AccountAccessEntry[];
  error?: string;
  reason?: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function permissionMatches(permission: string, requiredPermissionName: string): boolean {
  const required = normalize(requiredPermissionName);
  const normalized = normalize(permission);
  return normalized === '*' || normalized === required || normalized.endsWith(`.${required}`);
}

function accessEntryAppliesToAccount(entry: AccountAccessEntry, forAccount: string, byAccount: string): boolean {
  const accessOf = entry.accessOf?.trim() || byAccount;
  return accessOf === forAccount;
}

/**
 * ::neup.documentation::logica-account-connections-has-permission
 * ::function hasPermission(permissionName, forApplicationID, forAccount, byAccount, options)
 *
 * Checks whether `byAccount` has `permissionName` for `forAccount` in one application.
 *
 * ::public
 *
 * Returns a bridge-style response. `body.allowed` is true only when the server-provided permission snapshot for `byAccount` includes the requested permission under `forAccount`.
 *
 * ::public end
 *
 * ::private
 *
 * This checks assigned permissions in the account lookup payload. It does not check whether a permission definition exists.
 *
 * ::private end
 *
 * ::end
 */
export async function hasPermission(
  permissionName: string,
  forApplicationID: string,
  forAccount: string,
  byAccount: string,
  options: HasPermissionOptions = {},
): Promise<NeupBridgeResponse<HasPermissionResponseBody>> {
  const permission = permissionName.trim();
  const appId = forApplicationID.trim();
  const targetAccount = forAccount.trim();
  const actorAccount = byAccount.trim();

  if (!permission || !appId || !targetAccount || !actorAccount) {
    return {
      ok: false,
      status: 400,
      body: {
        success: false,
        allowed: false,
        permissionName: permission,
        forApplicationID: appId,
        forAccount: targetAccount,
        byAccount: actorAccount,
        access: [],
        error: 'invalid_request',
        reason: 'permissionName, forApplicationID, forAccount, and byAccount are required.',
      },
      headers: new Headers(),
    };
  }

  const url = new URL('/bridge/api.v1/accounts/lookup', baseJson.baseEndpoint);

  const headers = new Headers(options.headers);
  headers.set('content-type', 'application/json');

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      appId,
      appSecret: options.appSecret?.trim() || '',
      accountId: actorAccount,
    }),
    cache: 'no-store',
  });

  const lookupBody = (await response.json().catch(() => null)) as AccountLookupResponseBody | null;
  const access = (lookupBody?.access ?? []).filter((entry) =>
    accessEntryAppliesToAccount(entry, targetAccount, actorAccount)
  );
  const allowed = access.some((entry) =>
    entry.permissions.some((entryPermission) => permissionMatches(entryPermission, permission))
  );

  return {
    ok: response.ok,
    status: response.status,
    body: {
      success: Boolean(lookupBody?.success),
      allowed,
      permissionName: permission,
      forApplicationID: appId,
      forAccount: targetAccount,
      byAccount: actorAccount,
      access,
      ...(typeof lookupBody?.error === 'string' ? { error: lookupBody.error } : {}),
      ...(typeof lookupBody?.reason === 'string' ? { reason: lookupBody.reason } : {}),
    },
    headers: response.headers,
  };
}
