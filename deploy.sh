#!/bin/bash

# Configuration
REPO_URL="https://github.com/kelvinshcn/kelvinshcn.github.io.git"
TARGET_SUBDIR="flamegiraffe"
TEMP_DIR="deploy_temp_$(date +%s)"

echo "🚀 Starting deployment to $REPO_URL ($TARGET_SUBDIR)..."

# 1. Build the project
echo "📦 Building Next.js app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Create .nojekyll to allow _next directory on GitHub Pages
touch out/.nojekyll

# 2. Clone the destination repository
echo "📥 Cloning destination repository..."
git clone --depth 1 "$REPO_URL" "$TEMP_DIR"

if [ $? -ne 0 ]; then
    echo "❌ Git clone failed. Check your internet connection and permissions."
    exit 1
fi

# 3. Prepare destination directory
DEST_PATH="$TEMP_DIR/$TARGET_SUBDIR"
echo "📂 Preparing directory '$DEST_PATH'..."

# Create if doesn't exist, or clear it if it does (to remove old files)
if [ -d "$DEST_PATH" ]; then
    rm -rf "$DEST_PATH"/*
else
    mkdir -p "$DEST_PATH"
fi

# 4. Copy files
echo "📋 Copying new build files..."
cp -R out/* "$DEST_PATH/"

# 5. Commit and Push
echo "💾 Committing and pushing changes..."
cd "$TEMP_DIR"

# Configure git if needed (using current user's config if available)
# If running in a CI, you'd need to set these. Locally, it uses global config.

git add .
git commit -m "Deploy flamegiraffe updates $(date)"

# Use the original connection/auth
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🔗 Check your site at: https://kelvinshcn.github.io/$TARGET_SUBDIR/"
else
    echo "❌ Git push failed."
fi

# 6. Cleanup
cd ..
echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo "👋 Done!"
