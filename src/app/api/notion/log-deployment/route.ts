import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function POST(request: Request) {
  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    const body = await request.json();
    const {
      version,
      status = 'Success',
      environment = 'Production',
      deployUrl,
      changes,
      commitHash,
    } = body;

    // Get the Deployment Log database ID from environment
    const databaseId = process.env.NOTION_DEPLOYMENT_LOG_DB;

    if (!databaseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Deployment Log database not configured. Please run /api/notion/setup first and save the database IDs.',
        },
        { status: 404 }
      );
    }

    // Create a new deployment log entry
    const page = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: `Deployment - ${version || new Date().toISOString()}`,
              },
            },
          ],
        },
        Version: {
          rich_text: [
            {
              text: {
                content: version || 'N/A',
              },
            },
          ],
        },
        Date: {
          date: {
            start: new Date().toISOString(),
          },
        },
        Status: {
          select: {
            name: status,
          },
        },
        Environment: {
          select: {
            name: environment,
          },
        },
        ...(deployUrl && {
          'Deploy URL': {
            url: deployUrl,
          },
        }),
        ...(changes && {
          Changes: {
            rich_text: [
              {
                text: {
                  content: changes,
                },
              },
            ],
          },
        }),
        ...(commitHash && {
          'Commit Hash': {
            rich_text: [
              {
                text: {
                  content: commitHash,
                },
              },
            ],
          },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Deployment logged to Notion',
      pageId: page.id,
      pageUrl: page.url,
    });
  } catch (error: any) {
    console.error('Notion deployment logging error:', error);
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
