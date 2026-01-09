#!/bin/bash

# Fix tree-sitter for Bun
# Tree-sitter's index.js expects a prebuild at a specific path when running in Bun,
# but node-gyp-build builds it elsewhere. This script bridges that gap.

# Detect OS and Arch
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

if [ "$OS" == "darwin" ]; then
    if [ "$ARCH" == "arm64" ]; then
        PLATFORM="darwin-arm64"
    else
        PLATFORM="darwin-x64"
    fi
elif [ "$OS" == "linux" ]; then
     if [ "$ARCH" == "aarch64" ]; then
        PLATFORM="linux-arm64"
    else
        PLATFORM="linux-x64"
    fi
else
    # Fallback or other OS
    PLATFORM="${OS}-${ARCH}"
fi

# Determine where tree-sitter might have put the binary
# It usually uses node-gyp-build which checks prebuilds/ or build/Release/
POSSIBLE_LOCATIONS=(
    "node_modules/tree-sitter/build/Release/tree_sitter_binding.node"
    "node_modules/tree-sitter/build/Release/tree-sitter.node"
    "node_modules/tree-sitter/prebuilds/${PLATFORM}/tree-sitter.node"
    "node_modules/tree-sitter/prebuilds/${PLATFORM}/node.napi.node"
)

SOURCE_FILE=""
for LOC in "${POSSIBLE_LOCATIONS[@]}"; do
    if [ -f "$LOC" ]; then
        SOURCE_FILE="$LOC"
        break
    fi
done

# If not found, try a generic find (risky but helpful fallback)
if [ -z "$SOURCE_FILE" ]; then
     SOURCE_FILE=$(find node_modules/tree-sitter -name "*.node" | head -n 1)
fi

TARGET_DIR="dist/prebuilds/${PLATFORM}"

if [ -n "$SOURCE_FILE" ] && [ -f "$SOURCE_FILE" ]; then
  mkdir -p "$TARGET_DIR"
  cp "$SOURCE_FILE" "$TARGET_DIR/tree-sitter.node"
  echo "Fixed tree-sitter for Bun: Copied $SOURCE_FILE to $TARGET_DIR/tree-sitter.node"
else
  echo "Warning: Could not find tree-sitter binary to copy."
fi
