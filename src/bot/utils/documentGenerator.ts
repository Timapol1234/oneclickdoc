import { prisma } from '@/lib/prisma';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export async function generateDocumentHTML(documentId: string): Promise<string> {
  // Получаем документ с шаблоном
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      template: true,
      user: true
    }
  });

  if (!document) {
    throw new Error('Document not found');
  }

  // Парсим данные
  const filledData = JSON.parse(document.filledData);
  const contentData = JSON.parse(document.template.contentJson);

  // Заменяем плейсхолдеры в HTML
  let html = contentData.html || '';

  // Простая замена плейсхолдеров вида {{fieldName}}
  Object.keys(filledData).forEach(key => {
    const placeholder = `{{${key}}}`;
    const value = filledData[key] || '';
    html = html.replace(new RegExp(placeholder, 'g'), value);
  });

  // Оборачиваем в полный HTML документ
  const fullHTML = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.title}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 14pt;
      line-height: 1.5;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 1cm;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
  `;

  return fullHTML;
}

export async function createDocumentPDF(documentId: string): Promise<Buffer> {
  const html = await generateDocumentHTML(documentId);

  let browser = null;

  try {
    // Определяем окружение
    const isDev = process.env.NODE_ENV !== 'production';

    browser = await puppeteer.launch({
      args: isDev
        ? []
        : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: isDev
        ? process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser' || '/usr/bin/google-chrome'
        : await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Генерируем PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      }
    });

    return Buffer.from(pdf);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
