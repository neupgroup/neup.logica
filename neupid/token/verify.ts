/*
::neup.documentation::logica-neupid-token-verify-module
::title Logica NeupID Token Verification

Portable JWT verification helpers for NeupID tokens.

::public

Use this module to decode a NeupID JWT, check local expiry, and verify its RS256 signature with the bundled NeupID public key.

::public end

::private

The verifier prefers an explicit `publicKey` option, then the checked-in `_key/public.key` file, and finally the legacy `NEUPID_PUBLIC_KEY` or `NEUP_AUTH_PUBLIC_KEY` environment variables.

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

let bundledPublicKeyPromise: Promise<string | null> | undefined;

function b64urlToBase64(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  return pad ? base64 + '='.repeat(4 - pad) : base64;
}

function b64urlToBytes(input: string): Uint8Array {
  const binary = atob(b64urlToBase64(input));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function b64urlDecode(input: string): string {
  return atob(b64urlToBase64(input));
}

async function readBundledPublicKey(): Promise<string | null> {
  if (bundledPublicKeyPromise) {
    return bundledPublicKeyPromise;
  }

  bundledPublicKeyPromise = (async () => {
    if (typeof process === 'undefined' || !process.versions?.node) {
      return null;
    }

    try {
      const [{ readFile }, { fileURLToPath }] = await Promise.all([
        import('node:fs/promises'),
        import('node:url'),
      ]);
      const publicKeyPath = fileURLToPath(new URL('../_key/public.key', import.meta.url));
      const publicKey = (await readFile(publicKeyPath, 'utf8')).trim();
      return publicKey || null;
    } catch {
      return null;
    }
  })();

  return bundledPublicKeyPromise;
}

async function readPublicKey(options?: VerifyNeupIdTokenOptions): Promise<string> {
  const publicKey = options?.publicKey?.trim()
    || await readBundledPublicKey()
    || process.env.NEUPID_PUBLIC_KEY?.trim()
    || process.env.NEUP_AUTH_PUBLIC_KEY?.trim();

  if (!publicKey) {
    throw new Error('NeupID public key is required.');
  }

  return publicKey;
}

function normalizePublicKeyPem(publicKey: string): string {
  const normalized = publicKey.trim().replace(/\\n/g, '\n');
  return normalized.includes('-----/n') || normalized.includes('/n-----')
    ? normalized.replace(/\/n/g, '\n')
    : normalized;
}

async function importPublicKey(publicKey: string): Promise<CryptoKey> {
  const pemBody = normalizePublicKeyPem(publicKey)
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\n/g, '')
    .replace(/\r/g, '')
    .trim();

  if (!pemBody) {
    throw new Error('public_key_empty');
  }

  return crypto.subtle.importKey(
    'spki',
    toArrayBuffer(Uint8Array.from(atob(pemBody), (character) => character.charCodeAt(0))),
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
    const publicKey = await importPublicKey(await readPublicKey(options));
    const verified = await crypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5' },
      publicKey,
      toArrayBuffer(b64urlToBytes(parts[2])),
      toArrayBuffer(new TextEncoder().encode(`${parts[0]}.${parts[1]}`)),
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
