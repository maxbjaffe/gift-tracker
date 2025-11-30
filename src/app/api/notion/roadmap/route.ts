import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function POST(request: Request) {
  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    const body = await request.json();
    const {
      name,
      status = 'Planned',
      priority = 'Medium',
      category = 'Feature',
      targetDate,
      completedDate,
      description,
    } = body;

    // Get the Feature Roadmap database ID from environment
    const databaseId = process.env.NOTION_ROADMAP_DB;

    if (!databaseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Feature Roadmap database not configured. Please run /api/notion/setup first and save the database IDs.',
        },
        { status: 404 }
      );
    }

    // Create a new roadmap entry
    const page = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        Status: {
          select: {
            name: status,
          },
        },
        Priority: {
          select: {
            name: priority,
          },
        },
        Category: {
          select: {
            name: category,
          },
        },
        ...(targetDate && {
          'Target Date': {
            date: {
              start: targetDate,
            },
          },
        }),
        ...(completedDate && {
          'Completed Date': {
            date: {
              start: completedDate,
            },
          },
        }),
        ...(description && {
          Description: {
            rich_text: [
              {
                text: {
                  content: description,
                },
              },
            ],
          },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Roadmap item created',
      pageId: page.id,
      pageUrl: page.url,
    });
  } catch (error: any) {
    console.error('Notion roadmap creation error:', error);
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

export async function GET() {
  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    // Get the Feature Roadmap database ID from environment
    const databaseId = process.env.NOTION_ROADMAP_DB;

    if (!databaseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Feature Roadmap database not configured.',
        },
        { status: 404 }
      );
    }

    // Query all roadmap items
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Priority',
          direction: 'ascending',
        },
      ],
    });

    const items = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name?.title?.[0]?.plain_text || 'Untitled',
      status: page.properties.Status?.select?.name || '',
      priority: page.properties.Priority?.select?.name || '',
      category: page.properties.Category?.select?.name || '',
      targetDate: page.properties['Target Date']?.date?.start || null,
      completedDate: page.properties['Completed Date']?.date?.start || null,
      description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
      url: page.url,
    }));

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
    });
  } catch (error: any) {
    console.error('Notion roadmap query error:', error);
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
