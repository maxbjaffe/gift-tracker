// API endpoint for exporting recipient gift list as PDF
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipientId = params.id;
    const supabase = await createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get recipient data
    const { data: recipient, error: recipientError } = await supabase
      .from('recipients')
      .select('*')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (recipient.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to export this recipient' },
        { status: 403 }
      );
    }

    // Get all gifts for this recipient
    const { data: giftRecipients, error: giftsError } = await supabase
      .from('gift_recipients')
      .select(`
        *,
        gift:gifts(*)
      `)
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false });

    if (giftsError) {
      console.error('Error fetching gifts:', giftsError);
      return NextResponse.json(
        { error: 'Failed to fetch gifts' },
        { status: 500 }
      );
    }

    // Generate HTML for PDF
    const html = generatePDFHTML(recipient, giftRecipients || []);

    // Return HTML that can be printed as PDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="${recipient.name.replace(/[^a-z0-9]/gi, '_')}_Gift_List.html"`,
      },
    });
  } catch (error) {
    console.error('Error in export-pdf endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generatePDFHTML(recipient: any, giftRecipients: any[]): string {
  const today = new Date().toLocaleDateString();

  // Group gifts by status
  const ideas = giftRecipients.filter(gr => ['idea', 'considering'].includes(gr.status || 'idea'));
  const purchased = giftRecipients.filter(gr => ['purchased', 'wrapped', 'given'].includes(gr.status || ''));

  // Calculate totals
  const totalValue = giftRecipients.reduce((sum, gr) => sum + (gr.gift?.current_price || 0), 0);
  const purchasedValue = purchased.reduce((sum, gr) => sum + (gr.gift?.current_price || 0), 0);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${recipient.name}'s Gift List</title>
  <style>
    @media print {
      @page {
        margin: 0.5in;
        size: letter;
      }
      body {
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-after: always;
      }
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #7c3aed;
    }

    .header h1 {
      color: #7c3aed;
      margin: 0 0 10px 0;
      font-size: 28px;
    }

    .header .subtitle {
      color: #666;
      font-size: 14px;
    }

    .info-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 25px;
    }

    .info-box h3 {
      margin: 0 0 10px 0;
      color: #7c3aed;
      font-size: 16px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 14px;
    }

    .info-label {
      font-weight: 600;
      color: #4b5563;
    }

    .section {
      margin-bottom: 30px;
    }

    .section-title {
      color: #7c3aed;
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e5e7eb;
    }

    .gift-item {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
      break-inside: avoid;
    }

    .gift-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 8px;
    }

    .gift-name {
      font-weight: 600;
      font-size: 16px;
      color: #111827;
    }

    .gift-price {
      font-size: 16px;
      font-weight: 700;
      color: #7c3aed;
    }

    .gift-details {
      font-size: 13px;
      color: #6b7280;
      margin-top: 8px;
    }

    .gift-detail {
      margin: 4px 0;
    }

    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-idea {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge-purchased {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-reserved {
      background: #fed7aa;
      color: #92400e;
    }

    .totals-box {
      background: #f3f4f6;
      border: 2px solid #7c3aed;
      border-radius: 8px;
      padding: 20px;
      margin-top: 30px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 16px;
    }

    .totals-row.grand-total {
      border-top: 2px solid #7c3aed;
      padding-top: 12px;
      margin-top: 8px;
      font-weight: 700;
      font-size: 18px;
      color: #7c3aed;
    }

    .print-button {
      background: #7c3aed;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin: 20px auto;
      display: block;
    }

    .print-button:hover {
      background: #6d28d9;
    }

    .footer {
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

  <div class="header">
    <h1>${recipient.name}'s Gift List</h1>
    <div class="subtitle">Generated on ${today} • GiftStash</div>
  </div>

  <div class="info-box">
    <h3>Recipient Information</h3>
    ${recipient.relationship ? `<div class="info-row"><span class="info-label">Relationship:</span><span>${recipient.relationship}</span></div>` : ''}
    ${recipient.birthday ? `<div class="info-row"><span class="info-label">Birthday:</span><span>${new Date(recipient.birthday).toLocaleDateString()}</span></div>` : ''}
    ${recipient.age_range ? `<div class="info-row"><span class="info-label">Age:</span><span>${recipient.age_range}</span></div>` : ''}
    ${recipient.interests ? `<div class="info-row"><span class="info-label">Interests:</span><span>${recipient.interests}</span></div>` : ''}
    ${recipient.max_budget ? `<div class="info-row"><span class="info-label">Budget:</span><span>$${recipient.max_budget.toFixed(2)}</span></div>` : ''}
  </div>

  ${ideas.length > 0 ? `
  <div class="section">
    <h2 class="section-title">💡 Gift Ideas (${ideas.length})</h2>
    ${ideas.map(gr => `
      <div class="gift-item">
        <div class="gift-header">
          <div class="gift-name">${gr.gift?.name || 'Unnamed Gift'}</div>
          ${gr.gift?.current_price ? `<div class="gift-price">$${gr.gift.current_price.toFixed(2)}</div>` : ''}
        </div>
        ${gr.claimed_by_name ? `<span class="badge badge-reserved">Reserved by ${gr.claimed_by_name}</span>` : `<span class="badge badge-idea">Idea</span>`}
        ${gr.gift?.description ? `<div class="gift-details"><div class="gift-detail">${gr.gift.description}</div></div>` : ''}
        <div class="gift-details">
          ${gr.gift?.store ? `<div class="gift-detail"><strong>Store:</strong> ${gr.gift.store}</div>` : ''}
          ${gr.gift?.brand ? `<div class="gift-detail"><strong>Brand:</strong> ${gr.gift.brand}</div>` : ''}
          ${gr.gift?.url ? `<div class="gift-detail"><strong>Link:</strong> ${gr.gift.url}</div>` : ''}
          ${gr.occasion ? `<div class="gift-detail"><strong>Occasion:</strong> ${gr.occasion}</div>` : ''}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${purchased.length > 0 ? `
  <div class="section">
    <h2 class="section-title">✅ Purchased Gifts (${purchased.length})</h2>
    ${purchased.map(gr => `
      <div class="gift-item">
        <div class="gift-header">
          <div class="gift-name">${gr.gift?.name || 'Unnamed Gift'}</div>
          ${gr.gift?.current_price ? `<div class="gift-price">$${gr.gift.current_price.toFixed(2)}</div>` : ''}
        </div>
        <span class="badge badge-purchased">${gr.status || 'Purchased'}</span>
        ${gr.gift?.description ? `<div class="gift-details"><div class="gift-detail">${gr.gift.description}</div></div>` : ''}
        <div class="gift-details">
          ${gr.gift?.store ? `<div class="gift-detail"><strong>Store:</strong> ${gr.gift.store}</div>` : ''}
          ${gr.gift?.brand ? `<div class="gift-detail"><strong>Brand:</strong> ${gr.gift.brand}</div>` : ''}
          ${gr.occasion ? `<div class="gift-detail"><strong>Occasion:</strong> ${gr.occasion}</div>` : ''}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="totals-box">
    <div class="totals-row">
      <span>Total Gift Ideas:</span>
      <span>${ideas.length} items</span>
    </div>
    <div class="totals-row">
      <span>Purchased Gifts:</span>
      <span>${purchased.length} items</span>
    </div>
    <div class="totals-row">
      <span>Ideas Total Value:</span>
      <span>$${(totalValue - purchasedValue).toFixed(2)}</span>
    </div>
    <div class="totals-row">
      <span>Purchased Total:</span>
      <span>$${purchasedValue.toFixed(2)}</span>
    </div>
    <div class="totals-row grand-total">
      <span>Grand Total:</span>
      <span>$${totalValue.toFixed(2)}</span>
    </div>
  </div>

  <div class="footer">
    <p>Generated by GiftStash • Never forget a gift</p>
    ${recipient.share_enabled && recipient.share_token ? `
      <p>Share this list: ${request.nextUrl.origin}/share/${recipient.share_token}</p>
    ` : ''}
  </div>

  <script>
    // Auto-print dialog on mobile devices
    if (/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      document.querySelector('.print-button').addEventListener('click', () => {
        setTimeout(() => window.print(), 100);
      });
    }
  </script>
</body>
</html>
  `.trim();
}
