#!/bin/bash

# based on https://github.com/Camphor76-22-2/batocera-cookbook/blob/main/update_roms_folders.sh
# automatically finds labeled extra drives and generates rom folders and symbolic links so that you can add multiple extra drives and have it all just work.
# you can store roms for the same system on multiple drives with this method.
# created with the help of chat-gpt o1-preview

# Get the list of drives in /media, excluding specified names
drives=$(ls /media | grep -Ev '^(BATOCERA|SHARE|SYSTEM|NO_LABEL.*)$')

if [ -z "$drives" ]; then
    echo "No drives found to process."
    exit 1
fi

echo "Found drives: $drives"

# Get the list of ROM folders
romfolders=$(ls -1 /userdata/roms | grep -v "^\.")

if [ -z "$romfolders" ]; then
    echo "No ROM folders found to process."
    exit 1
fi

for drive in $drives; do
    echo "Processing drive: $drive"
    drive_path="/media/$drive"

    if [ ! -d "$drive_path" ]; then
        echo "Drive path $drive_path does not exist. Skipping."
        continue
    fi

    mkdir -p "$drive_path/batocera_roms"

    for f in $romfolders; do
        echo "Processing folder: $f"

        if [ ! -d "/userdata/roms/$f" ]; then
            echo "ROM folder /userdata/roms/$f does not exist. Skipping."
            continue
        fi

        mkdir -p "$drive_path/batocera_roms/$f"
        medianame=$(basename "$drive_path")
        mkdir -p "/userdata/roms/$f/drives/"

        link_target="$drive_path/batocera_roms/$f"
        link_name="/userdata/roms/$f/drives/$medianame"

        if [ -L "$link_name" ]; then
            echo "Link $link_name already exists. Skipping."
            continue
        fi

        echo "Linking $link_name to $link_target"
        ln -s "$link_target" "$link_name"
    done
done
