# Logica Account

Shared account-facing helpers that talk to the Neup auth bridge using
application credentials from environment variables and base URLs from
`base.json`.

## Documentation

- `guide.md`: canonical account, access, role, and permission modeling guide for other apps.

## Environment

- `NEUP_APP_ID`
- `NEUP_APP_SECRET`

JWT verification uses the bundled `./_key/public.key` by default.
`NEUPID_PUBLIC_KEY` and `NEUP_AUTH_PUBLIC_KEY` remain optional legacy overrides.

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

## Notes

- This module does not use fallback URLs or alternate environment variable
  names.
- The target application must expose `accountId`, `displayName`, and
  `displayImage` through its configured bridge response fields when using the
  connection identity helpers.
