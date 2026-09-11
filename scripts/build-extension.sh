#!/bin/bash
# Build script for MV3 Chrome extension

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

DIST_DIR="dist"

copy_required_file() {
    local source_file="$1"
    local destination_file="$2"
    local description="$3"

    if [ ! -f "$source_file" ]; then
        echo "Error: Required $description not found at $source_file" >&2
        exit 1
    fi

    mkdir -p "$(dirname "$destination_file")"
    cp "$source_file" "$destination_file"
}

validate_manifest_assets() {
    node <<'NODE'
const fs = require("fs");
const path = require("path");

const manifestPath = path.join("dist", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const requiredAssets = new Set();

function addAsset(value) {
  if (typeof value === "string" && value.length > 0) {
    requiredAssets.add(value);
  }
}

function addIconMap(iconMap) {
  if (iconMap && typeof iconMap === "object") {
    Object.values(iconMap).forEach(addAsset);
  }
}

addAsset(manifest.action && manifest.action.default_popup);
addIconMap(manifest.action && manifest.action.default_icon);
addAsset(manifest.options_ui && manifest.options_ui.page);
addIconMap(manifest.icons);

let missing = false;
for (const asset of [...requiredAssets].sort()) {
  const assetPath = path.join("dist", asset);
  if (!fs.existsSync(assetPath)) {
    console.error(`Error: Manifest-required asset missing from dist/: ${asset}`);
    missing = true;
  }
}

if (missing) {
  process.exit(1);
}
NODE
}

echo "Building TrackPull Chrome Extension..."
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/icons"

if [ ! -f "src/manifest.json" ]; then
    echo "Error: src/manifest.json not found" >&2
    exit 1
fi
cp src/manifest.json "$DIST_DIR/"
echo "Manifest copied to $DIST_DIR/manifest.json"

# Entry points: "<source>:<output bundle>"
ENTRY_POINTS=(
    "src/background/serviceWorker.ts:background.js"
    "src/content/interceptor.ts:interceptor.js"
    "src/content/bridge.ts:bridge.js"
    "src/content/portal_page_fetch.ts:portal_page_fetch.js"
    "src/content/portal_fetch.ts:portal_fetch.js"
    "src/popup/popup.ts:popup.js"
)

for entry in "${ENTRY_POINTS[@]}"; do
    source_file="${entry%%:*}"
    bundle_name="${entry##*:}"
    npx esbuild "$source_file" --bundle --outfile="$DIST_DIR/$bundle_name" --format=iife --platform=browser \
        || { echo "Error: Failed to build $bundle_name" >&2; exit 1; }
    echo "Bundled $source_file -> $DIST_DIR/$bundle_name"
done

if compgen -G "src/icons/*.png" > /dev/null; then
    cp src/icons/*.png "$DIST_DIR/icons/"
fi

copy_required_file "src/popup/popup.html" "$DIST_DIR/popup.html" "popup HTML"

echo "Validating manifest-required assets..."
validate_manifest_assets

echo "Validating HTML references bundled JS..."
for html_file in popup.html; do
  if grep -q '\.ts"' "$DIST_DIR/$html_file"; then
    echo "Error: $html_file references .ts files, must reference .js bundles only" >&2
    exit 1
  fi
done

echo "HTML validation passed - no TypeScript source references found"

echo "Build complete!"
