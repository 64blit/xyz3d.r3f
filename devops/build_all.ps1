# A script that runs ./build.ps1 then changes branches and runs ./build.ps1 again
#  Branches to build include: template-scroll, template-orbit, template-walkvr in that order

# Run build.ps1
./build.ps1

# Change to template-scroll branch
git checkout template-scroll

# Run build.ps1
./build.ps1

# Change to template-orbit branch
git checkout template-orbit

# Run build.ps1
./build.ps1

# Change to template-walkvr branch
git checkout template-walkvr

# Run build.ps1
./build.ps1
