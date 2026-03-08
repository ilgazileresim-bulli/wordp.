const fs = require('fs');
const generateDocx = require('html-to-docx');
(async () => {
    try {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head><title>Test</title></head>
<body><p>Test Content</p></body>
</html>`;
        const buffer = await generateDocx(htmlContent);
        fs.writeFileSync('test1.docx', buffer);
        console.log('test1.docx created with basic text');

        const htmlEmpty = `<!DOCTYPE html>
<html lang="en">
<head><title>Test</title></head>
<body><p></p></body>
</html>`;
        const bufferEmpty = await generateDocx(htmlEmpty);
        fs.writeFileSync('test2.docx', bufferEmpty);
        console.log('test2.docx created with empty p');

        const htmlSpace = `<!DOCTYPE html>
<html lang="en">
<head><title>Test</title></head>
<body><p>&nbsp;</p></body>
</html>`;
        const bufferSpace = await generateDocx(htmlSpace);
        fs.writeFileSync('test3.docx', bufferSpace);
        console.log('test3.docx created with &nbsp;');

    } catch (e) { console.error(e); }
})();
