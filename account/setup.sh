#!/bin/sh

# Account is a portable Logica submodule.  Keep its setup independent from the
# root Logica setup so an app can use account without installing Prisma.
set -eu

ACCOUNT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$ACCOUNT_DIR/../../.." && pwd)
BASE_DIR="$ROOT_DIR/@base"
FEATURES_FILE="$BASE_DIR/features.json"
MODULES_FILE="$BASE_DIR/modules.json"

has_account_module() {
    [ -f "$MODULES_FILE" ] || return 0
    node -e '
      const fs = require("fs");
      const modules = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
      process.exit(Array.isArray(modules) && modules.some((m) => m && m.name === "neup.account" && m.isRequired === true) ? 0 : 1);
    ' "$MODULES_FILE"
}

has_prisma_feature() {
    [ -f "$FEATURES_FILE" ] || return 1
    node -e '
      const fs = require("fs");
      const features = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
      const db = features && features["native.database"];
      process.exit(Boolean(db && db.interactionLayer === "prisma") ? 0 : 1);
    ' "$FEATURES_FILE"
}

if ! has_account_module; then
    printf 'Account module is not required; leaving %s untouched for the root pruner.\n' "$ACCOUNT_DIR"
    exit 0
fi

# This marker is deliberately local to account. Consumers may use it when
# composing optional database-backed account helpers without importing Prisma.
if has_prisma_feature; then
    printf '%s\n' 'prisma' > "$ACCOUNT_DIR/.database-feature"
else
    rm -f -- "$ACCOUNT_DIR/.database-feature"
fi

exit 0
