import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function POST() {
  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    // Get the GiftStash Project Hub page ID
    const hubPageId = '2ee4b476-b9de-4c26-9efa-18c883301023';

    // Create Brand Assets database
    const brandAssetsDb = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: hubPageId,
      },
      title: [
        {
          type: 'text',
          text: {
            content: 'Brand Assets',
          },
        },
      ],
      properties: {
        Name: {
          title: {},
        },
        Type: {
          select: {
            options: [
              { name: 'Logo', color: 'blue' },
              { name: 'Icon', color: 'purple' },
              { name: 'Avatar', color: 'green' },
              { name: 'Tagline', color: 'yellow' },
              { name: 'Screenshot', color: 'pink' },
              { name: 'Banner', color: 'red' },
              { name: 'Other', color: 'gray' },
            ],
          },
        },
        'File Path': {
          rich_text: {},
        },
        'File URL': {
          url: {},
        },
        Dimensions: {
          rich_text: {},
        },
        'Use Case': {
          rich_text: {},
        },
        'Date Added': {
          date: {},
        },
        Status: {
          select: {
            options: [
              { name: 'Active', color: 'green' },
              { name: 'Archived', color: 'gray' },
              { name: 'Draft', color: 'yellow' },
            ],
          },
        },
        Tags: {
          multi_select: {
            options: [
              { name: 'GiftStash', color: 'orange' },
              { name: 'Family Hub', color: 'blue' },
              { name: 'Primary', color: 'green' },
              { name: 'Secondary', color: 'purple' },
              { name: 'Social Media', color: 'pink' },
              { name: 'App Icon', color: 'red' },
            ],
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Brand Assets database created successfully',
      database: {
        id: brandAssetsDb.id,
        url: brandAssetsDb.url,
      },
    });
  } catch (error: any) {
    console.error('Notion brand assets setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.body,
      },
      { status: 500 }
    );
  }
}
