const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('./config.js');

// Path to the folder containing the collection definitions
// const collectionFolder = './search';
// const collectionFolder = '/userdata/home/batocera-custom-collection/search';
const collectionFolder = config.searchDir

// const node = '/userdata/home/node/bin/node';
const node = config.node;

// const renderText = '/userdata/home/batocera-custom-collection/renderText.js'
const renderText = path.join(__dirname, 'renderText.js');

// Function to check if an image exists
const imageExists = (outputBaseName, imageDir) => {
	// Image pattern: you can modify this to match your specific file naming convention
	const imagePatterns = [
        `${outputBaseName}.png`,
        `${outputBaseName}.svg`,
        `${outputBaseName}-w.svg`,
    ]

    for (const pattern of imagePatterns) {
        const imagePath = path.join(imageDir, pattern);
        if (fs.existsSync(imagePath)) {
            return true;
        }
    }

    return false;
};

// Function to render the image using renderText.js
const renderImage = (outputBaseName, outputDir) => {
	const command = `${node} ${renderText} "${outputBaseName}" --outputName="${outputBaseName}" --outputDir="${outputDir}"`;
	console.log(`Rendering image for: ${outputBaseName}`);
	exec(command, (err, stdout, stderr) => {
		if (err) {
			console.error(`Error rendering image for ${outputBaseName}: ${err}`);
			return;
		}
		console.log(`Rendered image for ${outputBaseName}:`, stdout);
	});
};

// Main function
const processCollections = (imageDir) => {
	// Read all collection definition files
	fs.readdir(collectionFolder, (err, files) => {
		if (err) {
			console.error(`Error reading collection folder: ${err}`);
			return;
		}

		files.forEach(file => {
            if (!file.endsWith('.js')) {
                return;
            }
			// Load each collection definition
			const collectionPath = path.join(collectionFolder, file);
			const collection = require(collectionPath);

            const outputBaseName = collection?.outputName || file.replace('.js', '')

			// Check if image exists
			if (!imageExists(outputBaseName, imageDir)) {
				// If image doesn't exist, render it
                console.log(`Rendering image for: ${collection.outputName}`);
				renderImage(outputBaseName, imageDir);
			} else {
				console.log(`Image already exists for: ${collection.outputName}`);
			}
		});
	});
};

// User specifies the image directory
const imageDir = config.collectionImagesDir || process.argv[2]; // Passed as a command-line argument
if (!imageDir) {
	console.error('Please specify the image directory.');
	process.exit(1);
}

// Process collections
processCollections(imageDir);
