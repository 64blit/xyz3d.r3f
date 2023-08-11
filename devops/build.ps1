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

yarn build

# Copy the dist folder contents to the preview destination
Write-Host "Copying dist folder contents to preview destination..."
Copy-Item -Path $build_path\* -Destination $preview_dest -Recurse -Force 

# Copy files and folders from src path to r3f_dest, excluding node_modules and dist
Write-Host "Copying src folder contents to r3f_dest..."
Copy-Item -Path $src_path\* -Destination $r3f_dest -Recurse -Force -Exclude "node_modules", "dist",  ".vscode",  "devops",  ".git"

Write-Host "Done!"
