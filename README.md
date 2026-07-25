/*
::neup.documentation::logica-folder

Artifacts exported for external logic consumers.

`logica/accounts/permissions.json`, `logica/accounts/roles.json`, and
`logica/basics/appinfo.json` are generated snapshots from the authz and
application tables. Regenerate them with
`npx tsx prisma/scripts/export-logica-authz.ts`.

See `logica/basics/README.md` for the generated snapshot contracts in the
`basics` folder.

`logica/neupid/` contains portable fetch-based helpers for resolving
bridge-backed account identity data from `NEUP_APP_ID`, `NEUP_APP_SECRET`,
and the auth base URLs stored in `logica/neupid/base.json`.

::end
*/
