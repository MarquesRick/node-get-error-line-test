const fs = require('fs');
const path = require('path');

console.log('ℹ️ SO: ', process.platform);

const fileName = process.argv[2];
if (fileName)
    readFile(fileName)
        .then((outputFilePath) => {
            console.log(`\n\n✅ Selected lines have been saved to ${outputFilePath}`);
        })
        .catch((error) => {
            console.error('\n\n🚨 Error:', error);
        });
else console.error('ℹ️ Usage: node index.js <file-name>');


// Function to read the file line by line and filter the desired lines
function readFile(fileName) {
    // fileName = path.join('data', fileName);
    return new Promise((resolve, reject) => {
        const filePath = path.join(path.dirname(process.execPath), fileName);
        const outputFilePath = filePath.replace('.txt', '_selected.txt');

        console.info(`\n🎯 File name: ${fileName}`);
        console.info(`\n🎯 File path: ${filePath}`);
        console.info(`\n🎯 Output File path: ${outputFilePath}`);

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


