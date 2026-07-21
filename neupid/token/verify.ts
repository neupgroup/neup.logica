/*
::neup.documentation::logica-neupid-token-verify-module
::title Logica NeupID Token Verification

Portable JWT verification helpers for NeupID tokens.

::public

Use this module to decode a NeupID JWT, check local expiry, and verify its RS256 signature with the public key from the environment.

::public end

::private

The verifier reads `NEUPID_PUBLIC_KEY` first, then falls back to the existing `NEUP_AUTH_PUBLIC_KEY` name used by this app.

::private end

::end
*/

export type NeupIdTokenPayload = {
  aid?: string;
  sid?: string;
  skey?: string;
  nid?: string;
  guest?: boolean | number;
  iat?: number;
  exp?: number;
  [claim: string]: unknown;
};

export type VerifyNeupIdTokenResult =
  | { valid: true; payload: NeupIdTokenPayload }
  | { valid: false; reason: string; payload?: Partial<NeupIdTokenPayload> };

type VerifyNeupIdTokenOptions = {
  publicKey?: string;
  now?: Date;
};

function b64urlToBase64(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  return pad ? base64 + '='.repeat(4 - pad) : base64;
}

function b64urlToBytes(input: string): Uint8Array {
  const binary = atob(b64urlToBase64(input));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function b64urlDecode(input: string): string {
  return atob(b64urlToBase64(input));
}

function readPublicKey(options?: VerifyNeupIdTokenOptions): string {
  const publicKey = options?.publicKey?.trim()
    || process.env.NEUPID_PUBLIC_KEY?.trim()
    || process.env.NEUP_AUTH_PUBLIC_KEY?.trim();

  if (!publicKey) {
    throw new Error('NEUPID_PUBLIC_KEY or NEUP_AUTH_PUBLIC_KEY is required.');
  }

  return publicKey;
}

async function importPublicKey(publicKey: string): Promise<CryptoKey> {
  const pemBody = publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\n/g, '')
    .replace(/\r/g, '')
    .trim();

  if (!pemBody) {
    throw new Error('public_key_empty');
  }

  return crypto.subtle.importKey(
    'spki',
    Uint8Array.from(atob(pemBody), (character) => character.charCodeAt(0)),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
}

export function decodeNeupIdToken(token: string | null | undefined): NeupIdTokenPayload | null {
  const trimmed = token?.trim();
  if (!trimmed) return null;

  const parts = trimmed.split('.');
  if (parts.length !== 3) return null;

  try {
    return JSON.parse(b64urlDecode(parts[1])) as NeupIdTokenPayload;
  } catch {
    return null;
  }
}

export function isNeupIdTokenExpired(
  payload: Pick<NeupIdTokenPayload, 'exp'> | null | undefined,
  now: Date = new Date(),
): boolean {
  return typeof payload?.exp === 'number' && payload.exp * 1000 <= now.getTime();
}

export async function verifyNeupIdToken(
  token: string | null | undefined,
  options: VerifyNeupIdTokenOptions = {},
): Promise<VerifyNeupIdTokenResult> {
  const trimmed = token?.trim();
  if (!trimmed) return { valid: false, reason: 'missing_token' };

  const parts = trimmed.split('.');
  if (parts.length !== 3) return { valid: false, reason: 'malformed_token' };

  const payload = decodeNeupIdToken(trimmed);
  if (!payload) return { valid: false, reason: 'invalid_payload' };

  if (isNeupIdTokenExpired(payload, options.now)) {
    return { valid: false, reason: 'token_expired', payload };
  }

  try {
    const publicKey = await importPublicKey(readPublicKey(options));
    const verified = await crypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5' },
      publicKey,
      b64urlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );

    if (!verified) {
      return { valid: false, reason: 'invalid_signature', payload };
    }

    return { valid: true, payload };
  } catch (error) {
    return {
      valid: false,
      reason: error instanceof Error ? error.message : 'verification_error',
      payload,
    };
  }
}
