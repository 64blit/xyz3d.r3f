#!/usr/bin/env fish

# Enable strict mode
set -e

# Set the path of the dist folder
set build_path "/Users/edmunddao/_SPACE/64blit/xyz3d.r3f/dist"

# Set the path of the src folder
set src_path "/Users/edmunddao/_SPACE/64blit/xyz3d.r3f"

# Set the template name
set template_name "scroll"

# Set the destination paths
set preview_dest "/Users/edmunddao/_SPACE/64blit/WebCrafterPro-blender-plugin/Templates/$template_name/preview"
set r3f_dest "/Users/edmunddao/_SPACE/64blit/WebCrafterPro-blender-plugin/Templates/$template_name/source"

# Ensure dependencies are installed
echo "Installing dependencies..."
yarn install || begin
    echo "❌ Yarn install failed."
    exit 1
end

echo "Building the project..."
cd "$src_path" || begin
    echo "❌ Failed to navigate to $src_path."
    exit 1
end

vite build --sourcemap false || begin
    echo "❌ Vite build failed."
    exit 1
end

# Check if the build directory exists and is not empty
if not test -d "$build_path" -a (count (ls -A "$build_path")) -gt 0
    echo "❌ Build failed or $build_path is empty."
    exit 1
end

echo "✅ Build successful. Copying files..."

# Ensure the destination directories exist
mkdir -p "$preview_dest"
mkdir -p "$r3f_dest"

echo "🗑️ Cleaning old files..."
rm -rf "$preview_dest"/*
rm -rf "$r3f_dest"/*
rm -r "$build_path/assets"

# Copy the dist folder contents to the preview destination
echo "📂 Copying dist to preview..."
cp -rv "$build_path"/. "$preview_dest"/ || begin
    echo "❌ Failed to copy dist to preview."
    exit 1
end

# Copy files/folders from src to r3f_dest, excluding unwanted dirs
echo "📂 Copying source to r3f_dest..."
rsync -av --exclude='node_modules' --exclude='dist' --exclude='out' --exclude='.next' --exclude='.vscode' --exclude='devops' --exclude='.git' "$src_path"/ "$r3f_dest"/ || begin
    echo "❌ Rsync failed."
    exit 1
end

# Remove unwanted files
echo "🗑️ Cleaning up unnecessary files..."
rm -f "$preview_dest"/assets/scene.glb
rm -f "$r3f_dest"/public/assets/scene.glb
rm -f "$preview_dest"/yarn.lock "$r3f_dest"/yarn.lock
rm -f "$preview_dest"/package-lock.json "$r3f_dest"/package-lock.json

echo "✅ Build and file transfer completed!"
