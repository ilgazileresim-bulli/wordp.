const fs = require('fs');
const generateDocx = require('html-to-docx');
(async () => {
    try {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head><title>Test</title></head>
<body><p>&#8203;</p></body>
</html>`;
        const buffer = await generateDocx(htmlContent, undefined, {
            orientation: 'portrait',
            margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        });
        fs.writeFileSync('test4.docx', buffer);
        console.log('test4.docx created');
    } catch (e) { console.error(e); }
})();
