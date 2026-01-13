#!/bin/bash

set -e

PROMPT_FILE="${1}"
MODEL="${2:-opencode/glm-4.7-free}"
SHARE="${3:-false}"
MAX_RETRIES="${4:-2}"
RETRY_DELAY="${5:-30}"
CONTINUE_ON_ERROR="${6:-false}"

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: Prompt file not found: $PROMPT_FILE"
  exit 1
fi

retry_count=0
success=false

while [ $retry_count -lt $MAX_RETRIES ]; do
  echo "Attempt $((retry_count + 1)) of $MAX_RETRIES"

  if opencode run "$(cat "$PROMPT_FILE")" --model "$MODEL" --share "$SHARE"; then
    echo "success=true" >> $GITHUB_OUTPUT
    success=true
    break
  else
    retry_count=$((retry_count + 1))
    echo "OpenCode execution failed, retrying in $RETRY_DELAY seconds..."
    sleep $RETRY_DELAY
  fi
done

if [ "$success" = false ]; then
  echo "success=false" >> $GITHUB_OUTPUT
  echo "All retry attempts failed"
  if [ "$CONTINUE_ON_ERROR" != "true" ]; then
    exit 1
  fi
fi
