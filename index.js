const fs = require('fs');
const readline = require('readline');
const path = require('path');

const fileName = process.argv[2];
console.log('dir: ', __dirname);

if (fileName)
    readFile(fileName)
        .then((outputFilePath) => {
            console.log(`Selected lines have been saved to ${outputFilePath}`);
        })
        .catch((error) => {
            console.error('🚨 Error:', error);
        });
else console.error('ℹ️ Usage: node index.js <file-name>');


// Function to read the file line by line and filter the desired lines
function readFile(fileName) {
    // fileName = path.join('data', fileName);
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, fileName);
        const outputFilePath = filePath.replace('.txt', '_selected.txt');

        console.info(`File name: ${fileName}`);
        console.info(`File path: ${filePath}`);
        console.info(`Output File path: ${outputFilePath}`);

        let errorLines = 0;

        const writableStream = fs.createWriteStream(outputFilePath);
        const stream = fs.createReadStream(filePath, { encoding: 'utf8' });

        stream.on('error', reject);
        writableStream.on('error', reject);


        const r1 = require('readline').createInterface({
            input: stream,
            crlfDelay: Infinity
        });

        r1.on('line', (line) => {
            line = line.replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\b/g, "");
            // Check if the line contains the special character └ followed by a space, a number, and a dot
            if (/└\s\d+\-/.test(line) || /└\s\d+\s-/.test(line) || /\s\d+\.\s/.test(line)
                || line.includes("PUT")
                || line.includes("GET")
                || line.includes("POST")
                || line.includes("DELETE")
            ) {
                if (line.includes('AssertionError') || line.includes('TypeError') || line.includes('JSONError ') || line.includes('ReferenceError'))
                    return;
                if (/\s\d+\.\s/.test(line)
                    && !(/└\s\d+\s-/.test(line) || /└\s\d+\-/.test(line) || /√\s/.test(line))) {
                    errorLines++;
                    writableStream.write(`🚨 ERROR: ${line}\n`);
                } else {
                    writableStream.write(`${line}\n`);
                }
            }
        });

        r1.on('close', () => {
            writableStream.write(`\n\n❌ TOTAL ERRORS: ${errorLines}`);
            writableStream.end();
            resolve(outputFilePath);
        });
    });
}


