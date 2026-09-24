#!/bin/sh

LOGICA_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$LOGICA_DIR/../.." && pwd)
BASE_DIR="$ROOT_DIR/@base"
MODULES_FILE="$BASE_DIR/modules.json"

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
    if [ ! -f "$MODULES_FILE" ]; then
        printf 'Cannot prune neup.logica: %s was not found.\n' "$MODULES_FILE" >&2
        return 1
    fi

    required_modules=$(node -e '
        const fs = require("fs");
        const modules = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
        if (!Array.isArray(modules) || modules.some((module) =>
            !module || typeof module.name !== "string" || typeof module.isRequired !== "boolean"
        )) process.exit(2);
        process.stdout.write(modules.filter((module) => module.isRequired).map((module) =>
            module.name.replace(/^neup\./, "").replace(/^notifications$/, "notification")
        ).join("\n"));
    ' "$MODULES_FILE") || {
        printf 'Invalid modules in %s.\n' "$MODULES_FILE" >&2
        return 1
    }

    for module_directory in "$LOGICA_DIR/account" "$LOGICA_DIR/analytics" "$LOGICA_DIR/drive" "$LOGICA_DIR/estate" "$LOGICA_DIR/notification" "$LOGICA_DIR/sites"; do
        module=${module_directory##*/}
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
