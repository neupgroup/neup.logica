<!--
::neup.documentation::logica-account-folder
::title Logica Account Folder

Account SDK object and bridge helper folder.

::public

This folder owns the `logica.account` object tree. Consumers enter through
`logica.account` and traverse child objects such as `auth`, `lookup`,
`current`, `accessible`, `connection`, and `application`.

::public end

::private

Bridge helper files remain local implementation details for the account object
surface. New public behavior should be exposed through a child object instead of
barrel-exporting helper functions from the folder index.

::private end

::end
-->

# Logica Account

Shared account-facing helpers that talk to the Neup auth bridge using
application credentials from environment variables and base URLs from
`base.json`.

## Documentation

- `guide.md`: canonical account, access, role, and permission modeling guide for other apps.

## Environment

- `NEUP_APP_ID`
- `NEUP_APP_SECRET`

JWT verification uses the bundled `./public.key` file.

## Base Configuration

- `baseEndpoint`
- `baseEndpointBridge`

## Available Helpers

- `connection.ts`: connected-account identity and `sign&get` helpers.
- `profile.ts`: bridge profile and permission route helpers.
- `access.ts`: connection/team access helpers.
- `team.ts`: unified team-member helper for application or connection lookups.
- `application.ts`: application export and app catalog sync helpers.
- `branding.ts`: branding helpers.
- `lookup/`: user-info lookup helpers for app-secret and auth-cookie lookup modes.

## Notes

- This module does not use fallback URLs or alternate environment variable
  names.
- The target application must expose `accountId`, `displayName`, and
  `displayImage` through its configured bridge response fields when using the
  connection identity helpers.
