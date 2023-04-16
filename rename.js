const fs = require('fs');
const path = require('path');

function replaceWithCounting(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  const pngFiles = files.filter(file => path.extname(file) === '.png');
  const count = pngFiles.length;

  pngFiles.forEach((file, index) => {
    const oldPath = path.join(directoryPath, file);
    const newPath = path.join(directoryPath, `/output/${count-index}.png`);
    fs.renameSync(oldPath, newPath);
  });

  console.log(`Replaced ${count} .png files with counting numbers.`);
}

// Example usage:
replaceWithCounting('./assets');