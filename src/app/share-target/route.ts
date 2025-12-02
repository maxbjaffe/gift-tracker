import { NextRequest, NextResponse } from 'next/server'

/**
 * POST handler for PWA Share Target
 *
 * The manifest.json declares:
 * "share_target": {
 *   "action": "/share-target",
 *   "method": "POST",
 *   "enctype": "multipart/form-data",
 *   "params": { "title": "title", "text": "text", "url": "url" }
 * }
 *
 * This handler receives the POST request and redirects to the page
 * with the shared data as query parameters.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const title = formData.get('title')?.toString() || ''
    const text = formData.get('text')?.toString() || ''
    const url = formData.get('url')?.toString() || ''

    // Build query params and redirect to the page component
    const params = new URLSearchParams()
    if (title) params.set('title', title)
    if (text) params.set('text', text)
    if (url) params.set('url', url)

    // Redirect to the share-target page which handles the logic
    return NextResponse.redirect(
      new URL(`/share-target?${params.toString()}`, request.url)
    )
  } catch (error) {
    console.error('[ShareTarget POST] Error:', error)
    // On error, redirect to the page anyway - it will show an error state
    return NextResponse.redirect(new URL('/share-target', request.url))
  }
}

/**
 * GET handler - just renders the page
 * (The page component handles the actual logic)
 */
export async function GET() {
  // GET requests are handled by the page.tsx component
  // This is just here for completeness
  return new NextResponse(null, { status: 200 })
}
