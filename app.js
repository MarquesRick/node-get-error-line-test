const fs = require('fs');
// Function to read the file line by line and filter the desired lines
function readFile(fileName) {
    return new Promise((resolve, reject) => {
        const desiredLines = [];

        const stream = fs.createReadStream(fileName, { encoding: 'utf8' });

        stream.on('data', (data) => {
            const lines = data.split('\n');
            lines.forEach((line) => {

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
                        desiredLines.push(`ERRO: ${line}`);
                    } else {
                        desiredLines.push(line);
                    }

                }
            });
        });

        stream.on('end', () => {
            resolve(desiredLines);
        });

        stream.on('error', (error) => {
            reject(error);
        });
    });
}

// Call the function to read the file
readFile('dados.txt')
    .then((lines) => {
        console.log('Desired lines:');
        lines.forEach((line) => {
            //if (line.includes("ERRO:"))
            console.log(line);
        });
        console.log(`Total de ERROS: `, lines.filter(str => str.includes("ERRO:")).length);
    })
    .catch((error) => {
        console.error('Error reading the file:', error);
    });
