import pdfParse from 'pdf-parse';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text.trim();
}

export function truncateText(text: string, maxChars = 15000): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '...[texto truncado]';
}
