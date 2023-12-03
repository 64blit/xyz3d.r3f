# A script that runs ./build.ps1 then changes branches and runs ./build.ps1 again
#  Branches to build include: template-scroll, template-orbit, template-walkvr in that order

# Change to template-scroll branch
git.exe checkout template-scroll

# Run build.ps1 with powershell
powershell.exe ./build.ps1

# Change to template-orbit branch
git.exe checkout template-orbit

# Run build.ps1
powershell.exe ./build.ps1


# Change to template-walkvr branch
git.exe checkout template-walkvr

# Run build.ps1
powershell.exe ./build.ps1
