#!/bin/bash

# Fix tree-sitter for Bun
# Tree-sitter's index.js expects a prebuild at a specific path when running in Bun,
# but node-gyp-build builds it elsewhere. This script bridges that gap.

TARGET_DIR="node_modules/tree-sitter/prebuilds/darwin-arm64"
SOURCE_FILE="node_modules/tree-sitter/build/Release/tree_sitter_runtime_binding.node"

if [ -f "$SOURCE_FILE" ]; then
  mkdir -p "$TARGET_DIR"
  cp "$SOURCE_FILE" "$TARGET_DIR/tree-sitter.node"
  echo "Fixed tree-sitter for Bun: Copied binary to $TARGET_DIR/tree-sitter.node"
else
  echo "Warning: Could not find built tree-sitter binary at $SOURCE_FILE"
  # Try to find it just in case
  FOUND=$(find node_modules/tree-sitter -name "*.node" | head -n 1)
  if [ -n "$FOUND" ]; then
     echo "   Found at $FOUND, copying..."
     mkdir -p "$TARGET_DIR"
     cp "$FOUND" "$TARGET_DIR/tree-sitter.node"
     echo "Fixed tree-sitter for Bun (using found binary)"
  else
     echo "Failed to fix tree-sitter. Build likely failed."
  fi
fi
