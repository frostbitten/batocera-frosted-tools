const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('./config.js');

const node = config.node || 'node';
const searchDir = config.searchDir;
const maxConcurrent = config.maxConcurrent;

const createCustomCollection = path.join(__dirname, 'createCustomCollection.js');
// Function to get all .js files in the search directory
function getJsFiles(dir) {
    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.js'))
        .map(file => path.join(dir, file));
}

// Function to run createCustomCollection for a given file
function runFile(file) {
    return new Promise((resolve, reject) => {
        console.log(`Processing ${file}...`);
        exec(`${node} ${createCustomCollection} --searchFile ${file}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error processing ${file}:`, err);
                reject(err);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
                return;
            }
            console.log(stdout);
            resolve();
        });
    });
}

// Main function to process files with concurrency limit
async function autoUpdate() {
    const jsFiles = getJsFiles(searchDir);

    if (jsFiles.length === 0) {
        console.log('No .js files found in the search directory.');
        return;
    }

    let promises = [];
    for (const file of jsFiles) {
        // Run the file and push the promise to the array
        promises.push(runFile(file));

        // If we reach the max concurrent limit, wait for any to complete
        if (promises.length >= maxConcurrent) {
            await Promise.race(promises); // Wait for one of the promises to resolve
            // Remove resolved promises from the array
            promises = promises.filter(p => p !== promises[0]);
        }
    }

    // Wait for any remaining promises to complete
    await Promise.all(promises);
}

autoUpdate();
