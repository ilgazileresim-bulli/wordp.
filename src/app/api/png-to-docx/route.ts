import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import generateDocx from 'html-to-docx';

export async function POST(req: NextRequest) {
    try {
        const { images, filename } = await req.json() as {
            images: { dataUrl: string; width: number; height: number }[];
            filename: string;
        };

        const maxW = 600;
        let imgHtml = '';
        for (const { dataUrl, width, height } of images) {
            const scale = width > maxW ? maxW / width : 1;
            const w = Math.round(width * scale);
            const h = Math.round(height * scale);
            imgHtml += `<p><img src="${dataUrl}" width="${w}" height="${h}" /></p>`;
        }

        const html = `<!DOCTYPE html><html><body>${imgHtml}</body></html>`;

        const docxBlob = await generateDocx(html, undefined, {
            orientation: 'portrait',
            margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        });

        return new NextResponse(docxBlob, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Error generating docx from image:', error);
        return NextResponse.json({ error: 'Failed to generate docx' }, { status: 500 });
    }
}
