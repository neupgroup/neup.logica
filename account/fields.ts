/*
::neup.documentation::logica-account-fields-file
::title Logica Account Fields File

Shared account field normalization helpers.

::public

This file normalizes field selectors used by account lookup, profile, and
connection object scopes.

::public end

::end
*/

import type { NeupUserInfoField } from '@/logica/account/lookup';

/*
::neup.documentation::logica-account-fields-type
::type AccountFields

Accepted account field selector input.

::public

Allows comma-delimited strings, string arrays, typed user-info field arrays, or
null when the bridge default fields should be used.

::public end

::end
*/
export type AccountFields = string | readonly string[] | readonly NeupUserInfoField[] | null;

const accountFieldSet = new Set<string>([
  'neupid',
  'displayName',
  'accountId',
  'displayImage',
  'lastActive',
  'isMinor',
  'connectionId',
  'accountType',
  'appId',
  'gender',
  'birthDate',
  'createdAt',
]);

/*
::neup.documentation::logica-account-normalize-account-fields-function
::function normalizeAccountFields(fields)

Normalizes account field selectors.

::public

Returns a de-duplicated list of supported account user-info fields, or
`undefined` when no valid fields were provided.

::public end

::end
*/
export function normalizeAccountFields(fields?: AccountFields): NeupUserInfoField[] | undefined {
  if (!fields) return undefined;

  const values = typeof fields === 'string'
    ? fields.split(',')
    : Array.from(fields);

  const normalized = values
    .map((field) => field.trim())
    .filter((field): field is NeupUserInfoField => accountFieldSet.has(field));

  return normalized.length ? Array.from(new Set(normalized)) : undefined;
}
