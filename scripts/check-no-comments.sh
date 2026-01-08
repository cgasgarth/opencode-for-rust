#!/bin/bash
# Check for comments in staged files (excluding scripts/check-no-comments.sh)
# Look for //, /*, */, * @, etc.
# This is a basic check and might need refinement.

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "\.ts$")

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

FAILED=0

for FILE in $STAGED_FILES; do
  if grep -E "(\/\/|\/\*|\*\/)" "$FILE" > /dev/null; then
    echo "❌ Error: Comments detected in $FILE"
    grep -E -n "(\/\/|\/\*|\*\/)" "$FILE"
    FAILED=1
  fi
done

if [ $FAILED -eq 1 ]; then
  echo "Please remove all comments before committing."
  exit 1
fi

exit 0
