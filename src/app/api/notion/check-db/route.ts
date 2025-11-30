import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function GET(request: Request) {
  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    const { searchParams } = new URL(request.url);
    const dbId = searchParams.get('id') || process.env.NOTION_DEPLOYMENT_LOG_DB;

    if (!dbId) {
      return NextResponse.json({ error: 'No database ID provided' }, { status: 400 });
    }

    const database = await notion.databases.retrieve({ database_id: dbId });

    return NextResponse.json({
      id: database.id,
      title: (database as any).title,
      properties: Object.keys((database as any).properties || {}),
      fullProperties: (database as any).properties,
    });
  } catch (error: any) {
    console.error('Notion check-db error:', error);
    return NextResponse.json(
      {
        error: error.message,
        details: error.body,
      },
      { status: 500 }
    );
  }
}
