/*
::neup.documentation::logica-neupid-token-authenticate-module
::title Logica NeupID Token Authentication

Portable NeupID token authentication helper.

::public

Use this module to reject locally expired tokens before calling the NeupID bridge validation API.

::public end

::private

The remote check defaults to `/bridge/api.v1/auth/validate` through the shared bridge runner.

::private end

::end
*/

import { runNeupBridgeApi, type NeupBridgeResponse } from '@/logica/core/api-runner';
import {
  decodeNeupIdToken,
  isNeupIdTokenExpired,
  verifyNeupIdToken,
  type NeupIdTokenPayload,
} from './verify';

type AuthenticateNeupIdTokenOptions = {
  app?: string;
  path?: string;
  now?: Date;
  verifyLocally?: boolean;
  publicKey?: string;
};

export type AuthenticateNeupIdTokenResult<TBody = unknown> =
  | { authenticated: true; payload: NeupIdTokenPayload; response: NeupBridgeResponse<TBody> }
  | {
      authenticated: false;
      reason: string;
      payload?: Partial<NeupIdTokenPayload>;
      response?: NeupBridgeResponse<TBody>;
    };

function isApiValidationSuccess(body: unknown): boolean {
  if (typeof body !== 'object' || body === null) return false;

  const record = body as Record<string, unknown>;
  return record.valid === true
    || record.authenticated === true
    || record.success === true
    || record.ok === true;
}

export async function authenticateNeupIdToken<TBody = unknown>(
  token: string | null | undefined,
  options: AuthenticateNeupIdTokenOptions = {},
): Promise<AuthenticateNeupIdTokenResult<TBody>> {
  const trimmed = token?.trim();
  if (!trimmed) return { authenticated: false, reason: 'missing_token' };

  const payload = decodeNeupIdToken(trimmed);
  if (!payload) return { authenticated: false, reason: 'invalid_payload' };

  if (isNeupIdTokenExpired(payload, options.now)) {
    return { authenticated: false, reason: 'token_expired', payload };
  }

  if (options.verifyLocally !== false) {
    const verification = await verifyNeupIdToken(trimmed, {
      publicKey: options.publicKey,
      now: options.now,
    });

    if (!verification.valid) {
      return {
        authenticated: false,
        reason: verification.reason,
        payload: verification.payload ?? payload,
      };
    }
  }

  const response = await runNeupBridgeApi<TBody>({
    path: options.path ?? '/bridge/api.v1/auth/validate',
    method: 'POST',
    query: options.app ? { app: options.app } : undefined,
    body: { token: trimmed },
  });

  if (!response.ok || !isApiValidationSuccess(response.body)) {
    return {
      authenticated: false,
      reason: response.ok ? 'api_rejected_token' : `api_status_${response.status}`,
      payload,
      response,
    };
  }

  return {
    authenticated: true,
    payload,
    response,
  };
}
