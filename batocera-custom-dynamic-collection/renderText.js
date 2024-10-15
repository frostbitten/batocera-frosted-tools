const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');

// Default values for canvas and text properties
const defaults = {
	canvasWidth: config?.renderText?.canvasWidth || 640,
	canvasHeight: config?.renderText?.canvasHeight || 360,
	fontSize: config?.renderText?.fontSize || 142,
	fontFamily: config?.renderText?.fontFamily || 'sans-serif',
	textColor: config?.renderText?.textColor || 'white',
	autoSize: config?.renderText?.autoSize || true,  // Auto-size text to fit canvas by default
	outputName: config?.renderText?.outputName || '',  // Will default to dash-spaced version of text if not provided
	padding: config?.renderText?.padding || 4,  // Padding around the text block
	dropShadow: config?.renderText?.dropShadow || { color: 'rgba(0, 0, 0, 0.5)', offsetX: 4, offsetY: 4 }, // Default drop shadow options
	stroke: config?.renderText?.stroke ||  { color: 'black', width: 2 }, // Default stroke options
	outputDir: config?.renderText?.outputDir || '.',  // Default output directory
};

// Parsing CLI arguments
const args = process.argv.slice(2);
if (!args.length) {
	console.error("Please provide text.");
	process.exit(1);
}

// Function to parse named arguments
function parseArgs(args) {
	const text = args[0]; // First argument is always the text
	const options = {};
	args.slice(1).forEach(arg => {
		const [key, value] = arg.split('=');
		if (key.startsWith('--')) {
			options[key.slice(2)] = isNaN(value) ? value : Number(value);
		}
	});
	return { text, options };
}

const { text, options } = parseArgs(args);

console.log({ options });

// Merge defaults with provided options
const canvasWidth = options.canvasWidth || defaults.canvasWidth;
const canvasHeight = options.canvasHeight || defaults.canvasHeight;
const autoSize = options.autoSize !== undefined ? options.autoSize === 'true' : defaults.autoSize;
let fontSize = options.fontSize || defaults.fontSize;
const fontFamily = options.fontFamily || defaults.fontFamily;
const textColor = options.textColor || defaults.textColor;
const padding = options.padding || defaults.padding;
const outputDir = options.outputDir || defaults.outputDir;
const outputName = options.outputName || text.replace(/\s+/g, '-');

// Drop shadow options
const dropShadow = {
	color: options.dropShadowColor || defaults.dropShadow.color,
	offsetX: options.dropShadowOffsetX ? Number(options.dropShadowOffsetX) : defaults.dropShadow.offsetX,
	offsetY: options.dropShadowOffsetY ? Number(options.dropShadowOffsetY) : defaults.dropShadow.offsetY,
};

// Stroke options
const stroke = {
	color: options.strokeColor || defaults.stroke.color,
	width: options.strokeWidth ? Number(options.strokeWidth) : defaults.stroke.width,
};

function calculateFontSizeToFit(ctx, text, maxWidth, maxHeight, fontSize, padding) {
	// Try different font sizes until the text fits in both the canvas dimensions
	let lines = [];
	
	while (fontSize > 10) { // Stop if font gets too small
		ctx.font = `${fontSize}px ${fontFamily}`;
		const words = text.split(' ');

		let currentLine = '';
		lines = [];  // Clear previous lines

		for (const word of words) {
			const width = ctx.measureText(currentLine + (currentLine ? ' ' : '') + word).width;
			if (width < maxWidth - padding * 2) {
				currentLine += (currentLine ? ' ' : '') + word;
			} else {
				lines.push(currentLine);
				currentLine = word;
			}
		}
		lines.push(currentLine); // Push the last line

		// Calculate total height of all lines
		const totalHeight = lines.length * fontSize;

		// Calculate the width of the last line
		const lastLineWidth = ctx.measureText(currentLine).width;

		// Check if both height and width fit
		if (totalHeight <= maxHeight - padding * 2 && lastLineWidth <= maxWidth - padding * 2) {
			// If it fits, return the font size and lines
			return { fontSize, lines };
		}

		// Otherwise, decrease font size and try again
		fontSize -= 2;
	}

	// If it can't fit, return the smallest font size and the original text
	return { fontSize: 10, lines: [text] };
}

function renderTextToPNG(text, outputFileName, outputDir, canvasWidth, canvasHeight, fontSize, fontFamily, textColor, autoSize, padding, dropShadow, stroke) {
	const canvas = createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');

	// Prepare canvas
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.fillStyle = textColor; // Set text color

	// Automatically adjust font size if needed
	let lines = [];
	if (autoSize) {
		const result = calculateFontSizeToFit(ctx, text, canvasWidth, canvasHeight, fontSize, padding);
		fontSize = result.fontSize;
		lines = result.lines;
	} else {
		ctx.font = `${fontSize}px ${fontFamily}`;
		const words = text.split(' ');
		let currentLine = words[0];

		for (let i = 1; i < words.length; i++) {
			const word = words[i];
			const width = ctx.measureText(currentLine + ' ' + word).width;
			if (width < canvasWidth - padding * 2) {
				currentLine += ' ' + word;
			} else {
				lines.push(currentLine);
				currentLine = word;
			}
		}
		lines.push(currentLine);
	}

	// Set text alignment and baseline for proper centering
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	// Calculate the total text block height and position the text block vertically
	const totalTextHeight = lines.length * fontSize;
	let y = (canvasHeight - totalTextHeight) / 2 + fontSize / 2;

	// Draw drop shadow if enabled
	if (dropShadow) {
		ctx.fillStyle = dropShadow.color;
		lines.forEach((line) => {
			ctx.fillText(line, canvasWidth / 2 + dropShadow.offsetX, y + dropShadow.offsetY);
			y += fontSize;
		});
	}

	// Draw stroke if enabled
	if (stroke.width > 0) {
		ctx.strokeStyle = stroke.color;
		ctx.lineWidth = stroke.width;

		// Reset y position for stroke drawing
		y = (canvasHeight - totalTextHeight) / 2 + fontSize / 2;

		lines.forEach((line) => {
			ctx.strokeText(line, canvasWidth / 2, y);
			y += fontSize;
		});
	}

	// Draw text
	ctx.fillStyle = textColor; // Reset fill color for text
	y = (canvasHeight - totalTextHeight) / 2 + fontSize / 2; // Reset y position for text

	lines.forEach((line) => {
		ctx.fillText(line, canvasWidth / 2, y);
		y += fontSize;
	});

	// Save PNG
	const buffer = canvas.toBuffer('image/png');
	fs.writeFileSync(path.join(outputDir, `${outputFileName}.png`), buffer);
	console.log(`Image saved as ${outputFileName}.png`);
}


renderTextToPNG(text, outputName, outputDir, canvasWidth, canvasHeight, fontSize, fontFamily, textColor, autoSize, padding, dropShadow, stroke);
