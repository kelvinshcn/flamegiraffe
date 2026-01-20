#!/bin/bash

# Configuration
# Usage: ./export_site.sh /path/to/kelvinshcn.github.io/flamegiraffe

DEST_DIR="$1"

if [ -z "$DEST_DIR" ]; then
    echo "Usage: $0 <destination_directory>"
    echo "Example: $0 ../kelvinshcn.github.io/flamegiraffe"
    exit 1
fi

echo "🚀 Starting static export..."

# 1. Build the project
echo "📦 Building Next.js app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# 2. Check destination
if [ ! -d "$DEST_DIR" ]; then
    echo "⚠️  Destination directory '$DEST_DIR' does not exist."
    read -p "Create it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p "$DEST_DIR"
    else
        echo "❌ Aborting."
        exit 1
    fi
fi

# 3. Copy files
echo "📂 Copying files to '$DEST_DIR'..."
# Clean destination first (optional but recommended for static sites)
# echo "Cleaning destination..."
# rm -rf "$DEST_DIR"/*

cp -R out/* "$DEST_DIR/"

echo "✅ Export complete!"
echo "You can now go to '$DEST_DIR' and push to GitHub."
