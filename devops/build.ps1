# Set the path of the dist folder
$build_path = "D:\_SPACE\Web\xyz3d.r3f\dist"

# Set the path of the src folder
$src_path = "D:\_SPACE\Web\xyz3d.r3f\"

# Set the destination paths
$preview_dest = "D:\_SPACE\Blender\WebCrafterPro-blender-plugin\Templates\scroll\preview"
$r3f_dest = "D:\_SPACE\Blender\WebCrafterPro-blender-plugin\Templates\scroll\source"

# Build the project using yarn
Write-Host "Building the project..."

Write-Host $build_path
Write-Host $preview_dest

# delete the preview destination
Write-Host "Deleting destination..."
Remove-Item -Path $preview_dest\* -Recurse -Force
Remove-Item -Path $r3f_dest\* -Recurse -Force

# run yarn build from the working directory of D:\_SPACE\Web\xyz3d.r3f\
cd "D:\_SPACE\Web\xyz3d.r3f\"
vite build --sourcemap "inline"

# Copy the dist folder contents to the preview destination
Write-Host "Copying dist folder contents to preview destination..."
Copy-Item -Path $build_path\* -Destination $preview_dest -Recurse -Force 

# Copy files and folders from src path to r3f_dest, excluding node_modules and dist
Write-Host "Copying src folder contents to r3f_dest..."
Copy-Item -Path $src_path\* -Destination $r3f_dest -Recurse -Force -Exclude "node_modules", "dist",  ".vscode",  "devops",  ".git"

# Remove the scene.glb file from the destination
Remove-Item -Path $preview_dest\assets\scene.glb
Remove-Item -Path $r3f_dest\public\assets\scene.glb


# Pause the script
Write-Host "Done!"