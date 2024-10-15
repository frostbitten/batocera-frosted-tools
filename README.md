# Frosted Tools for Batocera

This is my personal collection of scripts and tools to help batocera work just a little bit better. A large portion the code was created or reviewed with the help of Chat-GPT, with further manual review and refinements.

## Scripts

* **update_roms_folders.sh** - Multiple Drives All with ROMs
    
    This script is based on https://github.com/Camphor76-22-2/batocera-cookbook/blob/main/update_roms_folders.sh

    It makes it easy to have multiple storage drives, each with roms. Individual systems can have roms on multiple drives thanks to use of symlinks in subdirectories:

    `/userdata/roms/[system]/drives/[drive]/` is linked to `/media/[drive]/batocera_roms/[system]/`

    It will automatically look for named drives in `/media` that aren't `BATOCERA`, `SHARE`, `SYSTEM`, or `NO_LABEL` and create any missing game system folders, and create the symlinks.

## Tools

### Custom Dynamic Collection

**Features**

* Provides a robust dynamic collection system using `.js` files to describe a collection name and filters.

* Preview filter format at: [batocera-custom-dynamic-collection/search/simpsons.js](batocera-custom-dynamic-collection/search/simpsons.js)

* Can also render collection titles as images for use in some themes (requires extra installation steps).

**Installation**

This feature uses a simple one-line installation:
```
wget -qO install.sh https://raw.githubusercontent.com/frostbitten/batocera-frosted-tools/main/install.sh && bash ./install.sh
```
    
This will:

1. Create a folder at `/userdata/home`

2. Install node v18

3. Ensure node environment variables get loaded on boot

4. Setup collection update script to trigger when screensaver runs

**Usage**

To trigger the updates just manually launch the screensaver.

There are NO notifications of completion.

The scraper needs to have run at least once in order to ensure the game info is available for this tool. It relies on the `gamelist.xml` data for each system.


Be sure to enable your new collections at: 

    Game Collection Settings > Custom Game Collections

If you don't see the collection you may need to update the games list.
