const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const config = require('./config.js');

// Function to load and parse XML file
function parseXML(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) return reject(err);
            xml2js.parseString(data, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    });
}

// Function to apply filters
function applyFilters(games, filters) {
    return games.filter(game => {
        return filters.some(orBlock => {
            return orBlock.every(andFilter => {
                return applyAndFilter(game, andFilter);
            });
        });
    });
}

function applyAndFilter(game, filter) {
    // If 'empty' is specified, handle it first
    if ('empty' in filter) {
        const field = filter.in[0];
        const isEmpty = !game[field] || !game[field].trim();
        return filter.empty ? isEmpty : !isEmpty;
    }

    // Check each specified field for the text
    return filter.in.some(field => {
        if (game[field]) {
            const value = game[field].toLowerCase();
            const searchText = filter.text.toLowerCase();
            return filter.negate ? !value.includes(searchText) : value.includes(searchText);
        }
        return false;
    });
}


// Main function
async function createCustomCollection(filters, romsDir, outputDir, useOutputName = null) {
    const collections = [];

    console.log('filters', filters);

    const systems = fs.readdirSync(romsDir);
    for (const system of systems) {
        console.log('searching system', system);

        const gameListPath = path.join(romsDir, system, 'gamelist.xml');
        const systemDir = "./roms/" + system;
        
        if (fs.existsSync(gameListPath)) {
            const gameList = await parseXML(gameListPath);
            const games = gameList.gameList.game.map(game => {
                const gameObj = {};
                for (const key in game) {
                    if (game.hasOwnProperty(key)) {
                        gameObj[key] = game[key][0];
                    }
                }
                // Prepend system directory to the game's path
                gameObj.path = systemDir + gameObj.path.slice(1);
                return gameObj;
            });

            const filteredGames = applyFilters(games, filters);
            collections.push(...filteredGames.map(game => game.path));
        }
    }

    const outputName = useOutputName || path.basename(searchFile, '.js');
    const outputFilePath = path.join(outputDir, `custom-${outputName}.cfg`);

    const collectionData = collections.join('\n')+'\n';

    fs.writeFileSync(outputFilePath, collectionData);
    console.log(`Custom collection created: ${outputFilePath}`);
}

// Function to parse named arguments
function parseArgs(args) {
    const options = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2); // Remove '--'
            const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true; // Get value or set true
            options[key] = value;
            if (value !== true) i++; // Increment index if value was set
        }
    }
    return options;
}

// Command line arguments
const { 
    searchFile, 
    romsDir = config.romsDir || '/userdata/roms', 
    outputDir = config.outputDir || '/userdata/system/configs/emulationstation/collections', 
    outputName = null 
} = parseArgs(process.argv.slice(2));

const searchConfig = require(path.resolve(searchFile));

createCustomCollection(
    searchConfig?.filters || searchConfig, 
    searchConfig?.romsDir || romsDir, 
    searchConfig?.outputDir || outputDir, 
    searchConfig?.outputName || outputName
).catch(console.error);
