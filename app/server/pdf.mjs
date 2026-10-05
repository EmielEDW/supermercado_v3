import { PDFDocument } from 'pdf-lib';

// Below Vercel's 4.5 MB function request limit; raw uploads avoid multipart overhead.
export const MAX_PDF_BYTES = 4_000_000;

export async function validatePdf(bytes, contentType) {
  if (bytes.length === 0 || bytes.length > MAX_PDF_BYTES) throw new Error('Kies een pdf van maximaal 4 MB.');
  if (contentType?.split(';')[0] !== 'application/pdf' || bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('Dit bestand is geen geldige pdf.');
  try {
    const document = await PDFDocument.load(bytes, { throwOnInvalidObject: true });
    if (document.isEncrypted || document.getPageCount() < 1 || !bytes.subarray(-1024).toString().includes('%%EOF')) throw new Error('invalid');
  } catch { throw new Error('Deze pdf kan niet worden geopend. Kies een volledige pdf zonder wachtwoord.'); }
}
