import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function GET() {
  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    // Search for all pages and databases the integration has access to
    const response = await notion.search({
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
      page_size: 100,
    });

    // Separate pages and databases
    const pages = response.results
      .filter((item: any) => item.object === 'page')
      .map((page: any) => ({
        id: page.id,
        type: page.object,
        title: page.properties?.title?.title?.[0]?.plain_text ||
               page.properties?.Name?.title?.[0]?.plain_text ||
               'Untitled',
        url: page.url,
        created: page.created_time,
        lastEdited: page.last_edited_time,
      }));

    const databases = response.results
      .filter((item: any) => item.object === 'database')
      .map((db: any) => ({
        id: db.id,
        type: db.object,
        title: db.title?.[0]?.plain_text || 'Untitled Database',
        url: db.url,
        created: db.created_time,
        lastEdited: db.last_edited_time,
        properties: Object.keys(db.properties || {}),
      }));

    return NextResponse.json({
      success: true,
      pages,
      databases,
      total: {
        pages: pages.length,
        databases: databases.length,
      },
    });
  } catch (error: any) {
    console.error('Notion API error:', error);
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
