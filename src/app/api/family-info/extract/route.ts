/**
 * Document Extraction API
 * Upload and extract structured data from documents (PDFs, images) using Claude Vision
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const autoCreate = formData.get('autoCreate') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: PDF, JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('family-documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('family-documents')
      .getPublicUrl(fileName);

    // Convert file to base64 for Claude Vision (for images)
    let extractedText = '';
    let extractedData: any = null;

    if (file.type.startsWith('image/')) {
      // Use Claude Vision for images
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64,
                },
              },
              {
                type: 'text',
                text: `Please analyze this document and extract all relevant information. This appears to be a family document (insurance card, bill, medical record, contact info, etc.).

Extract and provide:
1. Document Type (Insurance, Contact, Financial, Healthcare, Education, Home, Auto, Legal, Other)
2. Title (brief, descriptive name for this document)
3. Key Information (all important details you can find)
4. Dates (any expiration, renewal, or important dates)
5. Contacts (names, phone numbers, emails, addresses)
6. Account/Policy Numbers
7. Any other relevant details

Format your response as JSON with these keys:
{
  "type": "document type",
  "title": "descriptive title",
  "description": "brief summary",
  "details": "all extracted information in markdown format",
  "tags": ["array", "of", "relevant", "tags"],
  "important_dates": {"renewal": "YYYY-MM-DD", "expiry": "YYYY-MM-DD"},
  "related_contacts": [{"name": "John Doe", "phone": "555-1234", "email": "john@example.com"}],
  "metadata": {"policy_number": "ABC123", "account_number": "456789"}
}

Provide only the JSON response, no other text.`,
              },
            ],
          },
        ],
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      extractedText = responseText;

      // Try to parse JSON response
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        extractedData = { raw: responseText };
      }
    } else {
      // For PDFs, we would need additional processing
      // For now, just record the upload
      extractedText = 'PDF uploaded - text extraction requires additional processing';
      extractedData = {
        type: 'Other',
        title: file.name,
        description: 'PDF document',
        details: 'File uploaded. Please add details manually.',
      };
    }

    // Save to documents table
    const { data: document, error: docError } = await supabase
      .from('family_info_documents')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
        processing_status: 'completed',
        extracted_text: extractedText,
        extracted_data: extractedData,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (docError) {
      console.error('Error saving document:', docError);
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
    }

    // Auto-create family info entry if requested
    let familyInfoId = null;
    if (autoCreate && extractedData) {
      const { data: familyInfo, error: familyInfoError } = await supabase
        .from('family_information')
        .insert({
          user_id: user.id,
          title: extractedData.title || file.name,
          type: extractedData.type || 'Other',
          description: extractedData.description || '',
          details: extractedData.details || '',
          tags: extractedData.tags || [],
          important_dates: extractedData.important_dates || {},
          related_contacts: extractedData.related_contacts || [],
          status: 'active',
          file_urls: [publicUrl],
          file_metadata: [
            {
              name: file.name,
              size: file.size,
              type: file.type,
              uploaded_at: new Date().toISOString(),
            },
          ],
        })
        .select('id')
        .single();

      if (!familyInfoError) {
        familyInfoId = familyInfo?.id;

        // Link document to family info
        await supabase
          .from('family_info_documents')
          .update({ family_info_id: familyInfoId })
          .eq('id', document.id);
      }
    }

    return NextResponse.json({
      document,
      extractedData,
      familyInfoId,
      message: autoCreate
        ? 'Document processed and family info entry created'
        : 'Document processed successfully',
    });
  } catch (error: any) {
    console.error('Error in document extraction:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'AI service error', details: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
