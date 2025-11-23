import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * GET /api/contact/vcard
 *
 * Generates and returns a vCard file for adding GiftStash to contacts
 * Optimized for iPhone with embedded logo (base64)
 */
export async function GET() {
  // Get the Twilio phone number from environment
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

  // Read and encode the logo as base64 for embedding
  // iOS doesn't reliably load external PHOTO URLs, so we embed it
  let photoData = '';
  try {
    const logoPath = join(process.cwd(), 'public', 'images', 'GiftStashIconGSv2.png');
    const logoBuffer = readFileSync(logoPath);
    const base64Logo = logoBuffer.toString('base64');
    photoData = `PHOTO;ENCODING=b;TYPE=PNG:${base64Logo}`;
  } catch (error) {
    console.error('Error loading logo for vCard:', error);
    // Fallback to URL if file read fails
    photoData = 'PHOTO;VALUE=URI;TYPE=PNG:https://www.giftstash.app/images/GiftStashIconGSv2.png';
  }

  // vCard 3.0 format (best compatibility with iOS)
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:GiftStash
ORG:GiftStash
TEL;TYPE=CELL:${twilioNumber}
URL:https://www.giftstash.app
EMAIL:hello@giftstash.app
NOTE:Your AI-powered gift tracking assistant. Text me gift ideas anytime! Try: "LEGO set for Mom" or "AirPods for Sarah - $249"
${photoData}
X-SOCIALPROFILE;TYPE=website:https://www.giftstash.app
END:VCARD`;

  // Return as downloadable file
  return new NextResponse(vcard, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="GiftStash.vcf"',
    },
  });
}
