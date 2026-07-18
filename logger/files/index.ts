'use server';

/*
::neup.documentation::logica-logger-files
::title Logica Logger Files

Server-side error logging for the account application.

::public

Use `logError()` for structured server/file error logging.

Use `logSystemError()` or `logErrorToDatabase()` for compatibility with older callers; both functions now write through the file-backed logger.

::public end

::private

This logger writes file-backed entries to `neup.core/logs/error.log`. The legacy `SystemError` table is not part of this application's Prisma schema.

::private end

::end
*/

import { headers } from 'next/headers';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

type LogType = 'ai' | 'database' | 'validation' | 'auth' | 'unknown' | 'webhook';
type ReportType = 'auto' | 'submitted';

export interface LogErrorParams {
  message: string;
  stack?: string;
  componentStack?: string;
  source?: string;
  details?: string;
}

async function getRequestIp(): Promise<string> {
  return (await headers()).get('x-forwarded-for') || 'Unknown IP';
}

function readAuthAccountId(rawCookie: string): string | null {
  const authCookie = rawCookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('auth_account='));

  if (!authCookie) return null;

  const token = decodeURIComponent(authCookie.slice('auth_account='.length));
  const [, body] = token.split('.');
  if (!body) return null;

  try {
    const padded = body.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4;
    const payloadText = Buffer.from(
      pad ? padded + '='.repeat(4 - pad) : padded,
      'base64',
    ).toString('utf8');
    const payload = JSON.parse(payloadText) as { aid?: unknown };
    return typeof payload.aid === 'string' ? payload.aid : null;
  } catch {
    return null;
  }
}

async function getActiveAccountId(): Promise<string | null> {
  const rawCookie = (await headers()).get('cookie') ?? '';
  return readAuthAccountId(rawCookie);
}

function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return 'Could not serialize the error object.';
  }
}

export async function logError(
  type: LogType,
  error: unknown,
  context: string = 'No context',
  reportType: ReportType = 'auto',
) {
  const errorMessage = normalizeError(error);
  const ip = await getRequestIp();
  const accountId = await getActiveAccountId();
  const firstLine = errorMessage.split('\n')[0];
  const signature = crypto.createHash('md5').update(`${type}:${firstLine}`).digest('hex');

  const logEntry = {
    type,
    reportType,
    context,
    message: errorMessage,
    signature,
    ip,
    accountId,
    timestamp: new Date().toISOString(),
  };

  // eslint-disable-next-line no-console
  console.error('ERROR', logEntry);

  try {
    const logFilePath = path.join(process.cwd(), 'neup.core', 'logs', 'error.log');
    const logDir = path.dirname(logFilePath);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logString = `[${logEntry.timestamp}] [${type}] [${reportType}] [${context}] [IP: ${ip}] [Account: ${accountId}] [Signature: ${signature}]\nMessage: ${errorMessage}\n${'-'.repeat(80)}\n`;
    fs.appendFileSync(logFilePath, logString, 'utf8');
  } catch (fileError) {
    // eslint-disable-next-line no-console
    console.error('CRITICAL: Could not write to error log file.', fileError);
  }
}

export async function logSystemError(
  message: string,
  context: string = 'No context',
) {
  await logError('unknown', message, context);
}

export async function logErrorToDatabase(
  params: LogErrorParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    const metadata = {
      stack: params.stack,
      componentStack: params.componentStack,
      details: params.details,
    };

    await logError('unknown', params.message, params.source || JSON.stringify(metadata));

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('CRITICAL: Failed to log error to database:', error);
    // eslint-disable-next-line no-console
    console.error('Original Error to be Logged:', params);
    return { success: false, error: errorMessage };
  }
}
