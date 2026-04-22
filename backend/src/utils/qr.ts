import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

export async function generateQRCode(shopSlug: string, frontendUrl: string): Promise<{ dataUrl: string; filePath: string }> {
  const shopUrl = `${frontendUrl}/shop/${shopSlug}`;

  // Generate as data URL
  const dataUrl = await QRCode.toDataURL(shopUrl, {
    width: 400,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'H'
  });

  // Also save as file
  const qrDir = path.join(process.cwd(), 'uploads', 'qr');
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }

  const filePath = path.join(qrDir, `${shopSlug}.png`);
  await QRCode.toFile(filePath, shopUrl, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'H'
  });

  return { dataUrl, filePath: `/uploads/qr/${shopSlug}.png` };
}
