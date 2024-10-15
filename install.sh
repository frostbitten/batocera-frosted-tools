#!/bin/bash

# Source nvm if the script exists
if [ -f "/etc/profile.d/nvm.sh" ]; then
    echo "Sourcing nvm..."
    source /etc/profile.d/nvm.sh
fi


# Create /userdata/home/ folder if it doesn't exist
if [ ! -d "/userdata/home/" ]; then
    mkdir -p /userdata/home/
fi

# Create /userdata/system/configs/emulationstation/scripts/screensaver-start folder if it doesn't exist
if [ ! -d "/userdata/system/configs/emulationstation/scripts/screensaver-start" ]; then
    mkdir -p /userdata/system/configs/emulationstation/scripts/screensaver-start
fi

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo "nvm not found. Installing nvm..."

    # Install nvm (Node Version Manager)
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

    # Add nvm to path by creating nvm.sh in /etc/profile.d/
    echo 'export NVM_DIR="$HOME/.nvm"' > /etc/profile.d/nvm.sh
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm' >> /etc/profile.d/nvm.sh

    # Ensure the script is executable
    chmod +x /etc/profile.d/nvm.sh

    # Save changes to overlay
    batocera-save-overlay

    # Source nvm
    source /etc/profile.d/nvm.sh

    # Install Node.js version 18
    nvm install 18
else
    echo "nvm is already installed. Skipping nvm installation."
fi

# Check if project is already installed
if [ -d "/userdata/home/batocera-frosted-tools/" ]; then
    read -p "Project already installed. Do you want to reinstall? (y/N): " REINSTALL
    REINSTALL=${REINSTALL:-n}
    if [[ "$REINSTALL" != [yY] ]]; then
        echo "Skipping reinstallation."
        exit 0
    fi
fi


# Download the project as zip
echo "Downloading project..."
curl -L https://github.com/frostbitten/batocera-frosted-tools/archive/refs/heads/main.zip -o /tmp/batocera-frosted-tools.zip

# Unzip to temporary directory
echo "Unzipping project..."
unzip -o /tmp/batocera-frosted-tools.zip -d /tmp/

# Copy files over to /userdata/home/batocera-frosted-tools, overwriting existing files but preserving others
echo "Copying project files..."
mkdir -p /userdata/home/batocera-frosted-tools/
rsync -av --progress /tmp/batocera-frosted-tools-main/* /userdata/home/batocera-frosted-tools/
rm -rf /tmp/batocera-frosted-tools-main/

# Ensure config.js exists
if [ ! -f "/userdata/home/batocera-frosted-tools/batocera-custom-dynamic-collection/config.js" ]; then
    echo "Creating config.js from config.js.example..."
    cp /userdata/home/batocera-frosted-tools/batocera-custom-dynamic-collection/config.js.example /userdata/home/batocera-frosted-tools/batocera-custom-dynamic-collection/config.js
fi

# Symlink screensaver-start.sh
echo "Setting up screensaver-start script as a symbolic link..."
ln -sf /userdata/home/batocera-frosted-tools/batocera-custom-dynamic-collection/scripts/screensaver-start.sh /userdata/system/configs/emulationstation/scripts/screensaver-start/screensaver-start.sh

# Make the script executable
chmod +x /userdata/home/batocera-frosted-tools/batocera-custom-dynamic-collection/scripts/screensaver-start.sh

# Run npm install to install dependencies (removing unnecessary package for Batocera compatibility)
echo "Running npm install..."
cd /userdata/home/batocera-frosted-tools/batocera-custom-dynamic-collection/
npm install --omit=optional

# Display message to user
echo "INSTALLATION COMPLETE.



If you need the collection title image rendering functionality,
additional manual installation steps are required.

SEE THE GITHUB FOR MORE INFO"

exit 0
