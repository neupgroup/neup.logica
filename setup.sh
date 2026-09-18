#!/bin/sh

LOGICA_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$LOGICA_DIR/../.." && pwd)
BASE_FILE="$ROOT_DIR/@base/application.json"

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
        if (!Array.isArray(modules) || modules.some((module) =>
            typeof module !== "string" || !/^[a-z][a-z0-9-]*$/.test(module)
        )) process.exit(2);
        process.stdout.write(modules.join("\n"));
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

prune_logica_modules || exit 1
