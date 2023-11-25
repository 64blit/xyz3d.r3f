# Set the path of the dist folder
$build_path = "C:\Users\edmun\OneDrive\Documents\_SPACE\Web\xyz3d.r3f\dist"

# Set the path of the src folder
$src_path = "C:\Users\edmun\OneDrive\Documents\_SPACE\Web\xyz3d.r3f\"
yarn install
# Set the destination paths
$preview_dest = "C:\Users\edmun\OneDrive\Documents\_SPACE\Blender\WebCrafterPro-blender-plugin\Templates\orbit\preview"
$r3f_dest = "C:\Users\edmun\OneDrive\Documents\_SPACE\Blender\WebCrafterPro-blender-plugin\Templates\orbit\source"

# Build the project using yarn
Write-Host "Building the project..."

Write-Host $build_path
Write-Host $preview_dest

# delete the preview destination
Write-Host "Deleting destination..."
Remove-Item -Path $preview_dest\* -Recurse -Force
Remove-Item -Path $r3f_dest\* -Recurse -Force

# run yarn build from the working directory of C:\Users\edmun\OneDrive\Documents\_SPACE\Web\xyz3d.r3f\
cd "C:\Users\edmun\OneDrive\Documents\_SPACE\Web\xyz3d.r3f\"
vite build --sourcemap false

# Copy the dist folder contents to the preview destination
Write-Host "Copying dist folder contents to preview destination..."
Copy-Item -Path $build_path\* -Destination $preview_dest -Recurse -Force 

# Copy files and folders from src path to r3f_dest, excluding node_modules and dist
Write-Host "Copying src folder contents to r3f_dest..."
Copy-Item -Path $src_path\* -Destination $r3f_dest -Recurse -Force -Exclude "node_modules", "dist", "out", ".next", ".vscode", "devops", ".git"

# Remove the scene.glb file from the destination
Remove-Item -Path $preview_dest\assets\scene.glb
Remove-Item -Path $r3f_dest\public\assets\scene.glb

# delete any lock files in the desitions
Remove-Item -Path $preview_dest\yarn.lock -ErrorAction SilentlyContinue
Remove-Item -Path $r3f_dest\yarn.lock -ErrorAction SilentlyContinue
Remove-Item -Path $preview_dest\package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Path $r3f_dest\package-lock.json -ErrorAction SilentlyContinue

# Pause the script
Write-Host "Done!"
