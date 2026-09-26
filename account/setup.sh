#!/bin/sh

# Account is a portable Logica submodule.
set -eu

ACCOUNT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$ACCOUNT_DIR/../../.." && pwd)
BASE_DIR="$ROOT_DIR/@base"
MODULES_FILE="$BASE_DIR/modules.json"

has_account_module() {
    [ -f "$MODULES_FILE" ] || return 0
    node -e '
      const fs = require("fs");
      const modules = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
      process.exit(Array.isArray(modules) && modules.some((m) => m && m.name === "neup.account" && m.isRequired === true) ? 0 : 1);
    ' "$MODULES_FILE"
}

if ! has_account_module; then
    printf 'Account module is not required; leaving %s untouched for the root pruner.\n' "$ACCOUNT_DIR"
    exit 0
fi

exit 0
