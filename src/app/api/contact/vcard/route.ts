import { NextResponse } from 'next/server';

/**
 * GET /api/contact/vcard
 *
 * Generates and returns a vCard file for adding GiftStash to contacts
 * Optimized for iPhone with logo support
 */
export async function GET() {
  // Get the Twilio phone number from environment
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

  // vCard 3.0 format (best compatibility with iOS)
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:GiftStash
ORG:GiftStash
TEL;TYPE=CELL:${twilioNumber}
URL:https://www.giftstash.app
EMAIL:hello@giftstash.app
NOTE:Your AI-powered gift tracking assistant. Text me gift ideas anytime! Try: "LEGO set for Mom" or "AirPods for Sarah - $249"
PHOTO;VALUE=URI;TYPE=PNG:https://www.giftstash.app/images/GiftStashIcon-512.png
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
