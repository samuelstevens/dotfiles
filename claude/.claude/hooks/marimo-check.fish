#!/usr/bin/env fish

# Hook to check marimo notebooks after Write/Edit operations
# Reads JSON from stdin containing tool result information

set INPUT (cat)

set FILE_PATH (echo $INPUT | jq -r '.tool_response.filePath // empty')

if test -z "$FILE_PATH"; or test "$FILE_PATH" = null
    exit 0
end

if not test -f "$FILE_PATH"
    exit 0
end

# Check if the file appears to be a marimo notebook
if grep -q "import marimo" "$FILE_PATH" 2>/dev/null; and grep -q "@app.cell" "$FILE_PATH" 2>/dev/null
    echo "Running marimo check on $FILE_PATH..."

    set CHECK_OUTPUT (uvx marimo check "$FILE_PATH" 2>&1)
    set CHECK_EXIT $status

    echo $CHECK_OUTPUT

    if test $CHECK_EXIT -ne 0
        echo "Marimo check failed for $FILE_PATH" >&2
        echo $CHECK_OUTPUT >&2
        echo "" >&2
        echo "Please run 'uvx marimo check $FILE_PATH' to see details and fix the issues. Don't ask the user anything, just do a best effort fix." >&2
        exit 2
    else
        echo "Marimo check passed"
        exit 0
    end
end

exit 0
