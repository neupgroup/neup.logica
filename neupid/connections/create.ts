/*
::neup.documentation::logica-account-connections-create-module
::title Logica Connections Create Helper

Portable wrapper for `POST /bridge/api.v1/accounts`.

::public

Use this module to create or reuse internal application connections for
brand-or-branch accounts and for individual-or-dependent accounts.

::public end

::private

This file only implements the trusted internal method. External signup-driven
connection creation should live in a different flow with its own creation token.

::private end

::end
*/

import { runNeupBridgeApi, type NeupBridgeResponse } from '@/logica/core/api-runner';

export type CreateInternalNeupConnectionInput = {
  accountId: string;
  authAccountToken: string;
  appId: string;
  appSecret: string;
  headers?: HeadersInit;
};

export type CreateNeupConnectionResponseBody = {
  success?: boolean;
  connectionId?: string;
  status?: string;
  error?: string;
  error_description?: string;
};

function requireNonEmptyValue(value: string | null | undefined, fieldName: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }
  return normalized;
}

async function createInternalConnection(
  input: CreateInternalNeupConnectionInput,
): Promise<NeupBridgeResponse<CreateNeupConnectionResponseBody>> {
  const accountId = requireNonEmptyValue(input.accountId, 'accountId');
  const authAccountToken = requireNonEmptyValue(input.authAccountToken, 'authAccountToken');
  const appId = requireNonEmptyValue(input.appId, 'appId');
  const appSecret = requireNonEmptyValue(input.appSecret, 'appSecret');

  return runNeupBridgeApi<CreateNeupConnectionResponseBody>({
    path: '/bridge/api.v1/accounts',
    method: 'POST',
    authAccountToken,
    headers: input.headers,
    body: {
      appId,
      appSecret,
      accountId,
    },
  });
}

export async function createBrandConnection(
  input: CreateInternalNeupConnectionInput,
): Promise<NeupBridgeResponse<CreateNeupConnectionResponseBody>> {
  return createInternalConnection(input);
}

export async function createIndividualConnection(
  input: CreateInternalNeupConnectionInput,
): Promise<NeupBridgeResponse<CreateNeupConnectionResponseBody>> {
  return createInternalConnection(input);
}
