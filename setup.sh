#!/bin/sh

LOGICA_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$LOGICA_DIR/../.." && pwd)
ACCOUNT_DIR="$LOGICA_DIR/account"
ENV_FILE="$ROOT_DIR/.env"
BASE_FILE="$ROOT_DIR/base/application.json"

load_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        return
    fi

    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
}

get_env_value() {
    primary_name=$1
    secondary_name=$2

    eval "primary_value=\${$primary_name-}"
    eval "secondary_value=\${$secondary_name-}"

    if [ -n "$primary_value" ]; then
        printf '%s\n' "$primary_value"
        return
    fi

    printf '%s\n' "$secondary_value"
}

normalize_bool() {
    value=$1
    printf '%s' "$value" | tr '[:upper:]' '[:lower:]'
}

write_disabled_account_stub() {
    mkdir -p "$ACCOUNT_DIR"

    cat > "$ACCOUNT_DIR/index.ts" <<'EOF_ACCOUNT'
export const account = {} as const;

export default account;
EOF_ACCOUNT
}

remove_prisma_account_files() {
    if [ ! -d "$ACCOUNT_DIR" ]; then
        return
    fi

    find "$ACCOUNT_DIR" -type f ! -name "index.ts" | while IFS= read -r file_path; do
        if grep -qiE 'prisma|@neup/core/database/prisma|core/database/prisma' "$file_path"; then
            rm -f "$file_path"
        fi
    done

    if [ -f "$ACCOUNT_DIR/index.ts" ] && [ ! -f "$ACCOUNT_DIR/self.ts" ]; then
        temp_file=$(mktemp)
        grep -v "account/self" "$ACCOUNT_DIR/index.ts" |
            grep -v "account.self = self;" > "$temp_file"
        mv "$temp_file" "$ACCOUNT_DIR/index.ts"
    fi
}

update_logica_index() {
    index_file="$LOGICA_DIR/index.ts"

    if [ ! -f "$index_file" ]; then
        return
    fi

    for module in account analytics drive estate notification sites; do
        module_directory="$LOGICA_DIR/$module"
        if [ -d "$module_directory" ]; then
            continue
        fi

        temp_file=$(mktemp)
        grep -Fv "import { $module } from '@neup/logica/$module';" "$index_file" |
            grep -Fv "  $module," |
            grep -Fv "export { $module };" |
            sed -E "s/, $module([,}])/,\1/g; s/\{ $module, /\{ /g; s/  $module,//g" > "$temp_file"
        mv "$temp_file" "$index_file"
    done

    temp_file=$(mktemp)
    sed -E 's/,,+/,/g; s/\{, /\{ /g; s/, \}/ \}/g' "$index_file" > "$temp_file"
    mv "$temp_file" "$index_file"
}

prune_logica_modules() {
    if [ ! -f "$BASE_FILE" ]; then
        printf 'Cannot prune neup.logica: %s was not found.\n' "$BASE_FILE" >&2
        return 1
    fi

    required_modules=$(node -e '
        const fs = require("fs");
        const config = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
        const modules = config.logica && config.logica.requiredModules;
        if (!Array.isArray(modules)) process.exit(2);
        process.stdout.write(modules.filter((module) => /^[a-z][a-z0-9-]*$/.test(module)).join("\n"));
    ' "$BASE_FILE") || {
        printf 'Invalid logica.requiredModules in %s.\n' "$BASE_FILE" >&2
        return 1
    }

    account_required=$(node -e '
        const fs = require("fs");
        const config = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
        process.stdout.write(config.account && config.account.isRequired === true ? "true" : "false");
    ' "$BASE_FILE")

    for module_directory in "$LOGICA_DIR/account" "$LOGICA_DIR/analytics" "$LOGICA_DIR/drive" "$LOGICA_DIR/estate" "$LOGICA_DIR/notification" "$LOGICA_DIR/sites"; do
        module=${module_directory##*/}
        if [ "$module" = "account" ] && [ "$account_required" = "true" ]; then
            continue
        fi
        if printf '%s\n' "$required_modules" | grep -Fqx "$module"; then
            continue
        fi
        if [ -d "$module_directory" ]; then
            printf 'Removing unused neup.logica module: %s\n' "$module"
            rm -rf -- "$module_directory"
        fi
    done

    update_logica_index
}

load_env_file

prune_logica_modules

project_id=$(get_env_value \
    "NEUPSITE_PROJECT_ID" \
    "NEXT_PUBLIC_NEUPSITE_PROJECT_ID"
)

if [ -z "$project_id" ]; then
    rm -rf "$LOGICA_DIR"
    exit 0
fi

account_enabled=$(get_env_value \
    "NEUPSITE_ACCOUNT_ENABLED" \
    "NEXT_PUBLIC_NEUPSITE_ACCOUNT_ENABLED"
)

if [ -z "$account_enabled" ] || \
   [ "$(normalize_bool "$account_enabled")" = "false" ]; then

    rm -rf "$ACCOUNT_DIR"
    write_disabled_account_stub
    exit 0
fi

has_local_lookup=$(get_env_value \
    "NEUPSITE_ACCOUNT_HASLOCAL_LOOKUP" \
    "NEXT_PUBLIC_NEUPSITE_ACCOUNT_HASLOCAL_LOOKUP"
)

if [ "$(normalize_bool "$has_local_lookup")" = "false" ]; then
    remove_prisma_account_files
fi
