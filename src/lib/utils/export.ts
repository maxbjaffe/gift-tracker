import { Gift, Recipient } from '@/Types/database.types'

export function exportToCSV(data: Gift[], filename: string = 'gifts.csv') {
  // Define CSV headers
  const headers = [
    'Name',
    'Category',
    'Status',
    'Price',
    'Store',
    'Brand',
    'Purchase Date',
    'Occasion',
    'Occasion Date',
    'URL',
    'Description',
    'Notes',
  ]

  // Convert data to CSV rows
  const rows = data.map(gift => [
    gift.name,
    gift.category || '',
    gift.status,
    gift.current_price?.toString() || '',
    gift.store || '',
    gift.brand || '',
    gift.purchase_date || '',
    gift.occasion || '',
    gift.occasion_date || '',
    gift.url || '',
    gift.description || '',
    gift.notes || '',
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export function exportRecipientsToCSV(data: Recipient[], filename: string = 'recipients.csv') {
  const headers = [
    'Name',
    'Relationship',
    'Birthday',
    'Age Range',
    'Gender',
    'Max Budget',
    'Interests',
    'Hobbies',
    'Favorite Brands',
    'Favorite Stores',
    'Notes',
  ]

  const rows = data.map(recipient => [
    recipient.name,
    recipient.relationship || '',
    recipient.birthday || '',
    recipient.age_range || '',
    recipient.gender || '',
    recipient.max_budget?.toString() || '',
    recipient.interests?.join('; ') || '',
    recipient.hobbies?.join('; ') || '',
    recipient.favorite_brands?.join('; ') || '',
    recipient.favorite_stores?.join('; ') || '',
    recipient.notes || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export function exportToPDF(data: Gift[], title: string = 'Gift List') {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            color: #8b5cf6;
            border-bottom: 2px solid #8b5cf6;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #8b5cf6;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-idea { background-color: #dbeafe; color: #1e40af; }
          .status-purchased { background-color: #d1fae5; color: #065f46; }
          .status-wrapped { background-color: #e9d5ff; color: #6b21a8; }
          .status-delivered { background-color: #f3f4f6; color: #374151; }
          .price { color: #059669; font-weight: bold; }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              <th>Gift Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Price</th>
              <th>Store</th>
              <th>Occasion</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(gift => `
              <tr>
                <td><strong>${gift.name}</strong></td>
                <td>${gift.category || '-'}</td>
                <td><span class="status-badge status-${gift.status}">${gift.status}</span></td>
                <td class="price">${gift.current_price ? '$' + gift.current_price.toFixed(2) : '-'}</td>
                <td>${gift.store || '-'}</td>
                <td>${gift.occasion || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Gift Tracker - Built with Next.js, Supabase, and Claude AI</p>
        </div>
      </body>
    </html>
  `

  // Open print dialog
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}
