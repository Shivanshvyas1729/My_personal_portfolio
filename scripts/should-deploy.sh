#!/bin/bash

# 1. Handle Vercel first deployment (no previous SHA)
if [ -n "$VERCEL" ] && [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  echo "Vercel: First deployment or manual build detected. Proceeding with build."
  exit 1
fi

# 2. Handle Netlify first deployment (no cached commit or CACHED_COMMIT_REF matches COMMIT_REF)
if [ -n "$NETLIFY" ]; then
  if [ -z "$CACHED_COMMIT_REF" ] || [ "$CACHED_COMMIT_REF" = "$COMMIT_REF" ]; then
    echo "Netlify: First deployment or cleared cache detected. Proceeding with build."
    exit 1
  fi
fi

# 3. Standard [skip ci] check for subsequent commits
COMMIT_MSG=$(git log -1 --pretty=%B)
if [[ "$COMMIT_MSG" == *"[skip ci]"* ]]; then
  echo "Detected [skip ci] in commit message. Skipping build."
  exit 0
else
  echo "Proceeding with build."
  exit 1
fi
