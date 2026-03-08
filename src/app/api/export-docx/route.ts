import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import generateDocx from 'html-to-docx';

export async function POST(req: NextRequest) {
    try {
        const { html, title } = await req.json();

        let safeHtml = html || '';
        // Eğer HTML içeriği neredeyse boşsa (sadece boş etiketler vs), Word'ün hata vermemesi için geçerli bir boş paragraf ekle
        if (!safeHtml.replace(/<[^>]*>?/gm, '').replace(/\s+/g, '').length) {
            // Word'ün "bozuk" hatası vermemesi için en az bir geçerli karakter (gizli) ekleyelim:
            safeHtml = '<p><span style="color: white; font-size: 1px;">.</span></p>';
        }

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title || 'Document'}</title>
</head>
<body>
    ${safeHtml}
</body>
</html>`;

        const docxBlob = await generateDocx(htmlContent, undefined, {
            orientation: 'portrait'
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
