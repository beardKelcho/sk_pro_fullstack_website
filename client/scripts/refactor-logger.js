const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../src');

function getAllFiles(dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(directoryPath);
let modifiedCount = 0;

files.forEach(file => {
    if (file.includes('utils/logger.ts')) return; // skip the logger itself

    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    let hasConsoleUsage = false;

    if (content.match(/console\.log\s*\(/g)) {
        content = content.replace(/console\.log\s*\(/g, 'logger.info(');
        hasConsoleUsage = true;
    }
    if (content.match(/console\.error\s*\(/g)) {
        content = content.replace(/console\.error\s*\(/g, 'logger.error(');
        hasConsoleUsage = true;
    }
    if (content.match(/console\.warn\s*\(/g)) {
        content = content.replace(/console\.warn\s*\(/g, 'logger.warn(');
        hasConsoleUsage = true;
    }
    if (content.match(/console\.debug\s*\(/g)) {
        content = content.replace(/console\.debug\s*\(/g, 'logger.debug(');
        hasConsoleUsage = true;
    }
    if (content.match(/console\.info\s*\(/g)) {
        content = content.replace(/console\.info\s*\(/g, 'logger.info(');
        hasConsoleUsage = true;
    }

    if (hasConsoleUsage) {
        // Check if logger is already imported
        if (!content.includes('import logger from')) {
            const importStatement = "import logger from '@/utils/logger';\n";
            const useClientRegex = /^'use client';?\n?/m;
            const ucMatch = useClientRegex.exec(content);
            if (ucMatch) {
                content = content.slice(0, ucMatch.index + ucMatch[0].length) + "\n" + importStatement + content.slice(ucMatch.index + ucMatch[0].length);
            } else {
                content = importStatement + content;
            }
        }

        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            modifiedCount++;
            console.log(`Updated ${file}`);
        }
    }
});

console.log(`Refactoring complete. ${modifiedCount} files updated.`);
