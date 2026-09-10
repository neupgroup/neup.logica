/*
::neup.documentation::logica-logger-object-api
::title Logica Logger Object API

::public

Use `logica.logger()` to create a scoped logger for the current application.

Use `logica.logger.data(data).type(type).log()` to push structured logs and
`logica.logger.data(data).log()` when the type should default to `log`.

`type` is always sent as a string. Logger requests include the project `slug`
and `ingestKey`. The slug is resolved from `NEXT_PUBLIC_NEUP_LOGGER_ID`, then
`base.json.identity.logica.logger.slug`. If none is
configured, the request is not sent and the failure is written to the console.
The ingest key is resolved from `NEXT_PUBLIC_NEUP_LOGGER_INGEST_KEY`, or can
be supplied per call with `logica.ingestKey(value).log(data)`.

Use `logica.logger(async () => { ... })` or `logica.logger().catch(...)`
to wrap work, auto-log thrown errors, and rethrow them.

::public end

::end
*/

import { getEnvVariable } from '#/core/helpers/env';
import baseJson from '#/logica/base.json';
import { requestLoggerApi, type LoggerApiResponse } from '#/logica/logger/api';

export type LoggerPayload =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null
  | undefined;

export type LoggerDraft = {
  slug?: string;
  type?: string;
  ingestKey?: string;
  data?: LoggerPayload;
};

export type LoggerBridgeBody = {
  success: boolean;
  activity?: unknown;
  error?: string;
};

export type LoggerCatchContext = Record<string, unknown>;

type LoggerCallback<T> = () => Promise<T> | T;

export type LoggerScope = {
  data(data: LoggerPayload): LoggerScope;
  type(type: string): LoggerScope;
  ingestKey(ingestKey: string): LoggerScope;
  log(data?: LoggerPayload): Promise<LoggerApiResponse<LoggerBridgeBody>>;
  error(error?: unknown): Promise<LoggerApiResponse<LoggerBridgeBody>>;
  catch<T>(callback: LoggerCallback<T>, context?: LoggerCatchContext): Promise<T>;
  wrap<TArgs extends unknown[], TResult>(
    callback: (...args: TArgs) => Promise<TResult> | TResult,
    context?: LoggerCatchContext,
  ): (...args: TArgs) => Promise<TResult>;
  getProject(): { projectId?: string; projectName: string; slug: string };
};

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function requireLoggerEnv(name: 'NEXT_PUBLIC_NEUP_LOGGER_ID' | 'NEXT_PUBLIC_NEUP_LOGGER_INGEST_KEY') {
  const value = getEnvVariable(name, true) || trimString(process.env[name]);

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function inferProjectName(projectId: string) {
  const explicitName = getEnvVariable('APP_NAME', true)
    || trimString(process.env.npm_package_name);

  if (explicitName) {
    return explicitName;
  }

  if (projectId) {
    return projectId;
  }

  const envUrl = getEnvVariable('APP_URL', true)
    || trimString(baseJson.cloud);

  if (envUrl) {
    try {
      return new URL(envUrl).hostname;
    } catch {
      return envUrl;
    }
  }

  if (typeof window !== 'undefined' && window.location.hostname.trim()) {
    return window.location.hostname.trim();
  }

  return 'unknown-project';
}

function inferProjectSlug() {
  const loggerIdentity = (baseJson as typeof baseJson & {
    identity?: { logica?: { logger?: { slug?: unknown } } };
  }).identity?.logica?.logger?.slug;
  return trimString(process.env.NEXT_PUBLIC_NEUP_LOGGER_ID)
    || trimString(getEnvVariable('NEXT_PUBLIC_NEUP_LOGGER_ID', true))
    || trimString(loggerIdentity);
}

function normalizeData(data: LoggerPayload): Record<string, unknown> {
  if (data === undefined) {
    return {};
  }

  if (data instanceof Error) {
    return {
      message: data.message,
      name: data.name,
      stack: data.stack,
      cause: data.cause ?? null,
    };
  }

  if (Array.isArray(data)) {
    return { items: data };
  }

  if (data && typeof data === 'object') {
    return data as Record<string, unknown>;
  }

  return { value: data };
}

function normalizeCaughtError(error: unknown, context?: LoggerCatchContext) {
  const base = error instanceof Error
    ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause ?? null,
      }
    : normalizeData(error as LoggerPayload);

  return context ? { ...base, context } : base;
}

function createLoggerScope(
  draft: LoggerDraft = {},
): LoggerScope {
  const projectId = requireLoggerEnv('NEXT_PUBLIC_NEUP_LOGGER_ID');
  const projectName = inferProjectName(projectId);
  const projectSlug = trimString(draft.slug) || inferProjectSlug();
  const ingestKey = trimString(draft.ingestKey)
    || requireLoggerEnv('NEXT_PUBLIC_NEUP_LOGGER_INGEST_KEY');

  async function send(
    path: '/bridge/api.v1/logger' | '/bridge/api.v1/logger/error',
    nextDraft: LoggerDraft,
  ) {
    if (!projectSlug || !ingestKey) {
      const error = new Error(!projectSlug
        ? 'Logger project slug is missing. Configure NEXT_PUBLIC_NEUP_LOGGER_ID or base.json.identity.logica.logger.slug.'
        : 'Logger ingest key is missing. Configure NEXT_PUBLIC_NEUP_LOGGER_INGEST_KEY or pass it to logica.logger().ingestKey(value).');
      console.error('[logica.logger] Log was not sent.', error);
      return { ok: false, status: 0, body: { success: false, error: error.message } } as LoggerApiResponse<LoggerBridgeBody>;
    }

    try {
      return await requestLoggerApi<LoggerBridgeBody>({
        path,
        method: 'POST',
        body: {
          projectId,
          projectName,
          slug: projectSlug,
          ingestKey,
          type: trimString(nextDraft.type) || 'log',
          data: normalizeData(nextDraft.data),
        },
      });
    } catch (error) {
      console.error('[logica.logger] Log could not be sent.', error);
      throw error;
    }
  }

  return {
    data(data: LoggerPayload) {
      return createLoggerScope({
        ...draft,
        data,
      });
    },

    type(type: string) {
      return createLoggerScope({
        ...draft,
        type,
      });
    },

    ingestKey(value: string) {
      return createLoggerScope({
        ...draft,
        ingestKey: value,
      });
    },

    log(data?: LoggerPayload) {
      return send('/bridge/api.v1/logger', {
        ...draft,
        type: trimString(draft.type) || 'log',
        data: data ?? draft.data,
      });
    },

    error(error?: unknown) {
      return send('/bridge/api.v1/logger/error', {
        ...draft,
        type: 'error',
        data: normalizeCaughtError(error ?? draft.data),
      });
    },

    async catch<T>(callback: LoggerCallback<T>, context?: LoggerCatchContext) {
      try {
        return await callback();
      } catch (error) {
        await send('/bridge/api.v1/logger/error', {
          type: 'error',
          data: normalizeCaughtError(error, context),
        });

        throw error;
      }
    },

    wrap<TArgs extends unknown[], TResult>(
      callback: (...args: TArgs) => Promise<TResult> | TResult,
      context?: LoggerCatchContext,
    ) {
      return async (...args: TArgs) => {
        return this.catch(() => callback(...args), context);
      };
    },

    getProject() {
      return {
        projectId,
        projectName,
        slug: projectSlug,
      };
    },
  };
}

type LoggerFactoryInput = LoggerCallback<unknown>;

type LoggerFactory = {
  (): LoggerScope;
  (slug: string): LoggerScope;
  <T>(callback: LoggerCallback<T>, context?: LoggerCatchContext): Promise<T>;
  data(data: LoggerPayload): LoggerScope;
  type(type: string): LoggerScope;
  ingestKey(ingestKey: string): LoggerScope;
  error(error?: unknown): Promise<LoggerApiResponse<LoggerBridgeBody>>;
  wrap<TArgs extends unknown[], TResult>(
    callback: (...args: TArgs) => Promise<TResult> | TResult,
    context?: LoggerCatchContext,
  ): (...args: TArgs) => Promise<TResult>;
  getBasepath(): string;
};

function isLoggerCallback<T>(value: LoggerFactoryInput | string | undefined): value is LoggerCallback<T> {
  return typeof value === 'function';
}

function loggerFactory(): LoggerScope;
function loggerFactory(slug: string): LoggerScope;
function loggerFactory<T>(
  callback: LoggerCallback<T>,
  context?: LoggerCatchContext,
): Promise<T>;
function loggerFactory<T>(
  input?: LoggerCallback<T> | string,
  context?: LoggerCatchContext,
): LoggerScope | Promise<T> {
  if (isLoggerCallback<T>(input)) {
    return createLoggerScope().catch(input, context);
  }

  if (typeof input === 'string') {
    return createLoggerScope({ slug: input });
  }

  return createLoggerScope();
}

export const logger: LoggerFactory = Object.assign(
  loggerFactory,
  {
    data(data: LoggerPayload) {
      return createLoggerScope().data(data);
    },

    type(type: string) {
      return createLoggerScope().type(type);
    },

    ingestKey(ingestKey: string) {
      return createLoggerScope().ingestKey(ingestKey);
    },

    error(error?: unknown) {
      return createLoggerScope().error(error);
    },

    wrap<TArgs extends unknown[], TResult>(
      callback: (...args: TArgs) => Promise<TResult> | TResult,
      context?: LoggerCatchContext,
    ) {
      return createLoggerScope().wrap(callback, context);
    },

    getBasepath() {
      return baseJson.cloud;
    },
  },
);

export { createLoggerScope };
export { requestLoggerApi } from '#/logica/logger/api';
export type { LoggerApiResponse } from '#/logica/logger/api';

export default logger;
