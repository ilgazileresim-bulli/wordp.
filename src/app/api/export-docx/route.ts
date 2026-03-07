import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import generateDocx from 'html-to-docx';

export async function POST(req: NextRequest) {
    try {
        const { html, title } = await req.json();

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${title || 'Document'}</title>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `;

        const docxBlob = await generateDocx(htmlContent, undefined, {
            orientation: 'portrait',
            margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        });

        return new NextResponse(docxBlob, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${title || 'document'}.docx"`,
            },
        });
    } catch (error) {
        console.error('Error generating docx:', error);
        return NextResponse.json({ error: 'Failed to generate docx' }, { status: 500 });
    }
}
