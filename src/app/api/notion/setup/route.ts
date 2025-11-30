import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function POST() {
  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    // Get the GiftStash Project Hub page ID
    const hubPageId = '2ee4b476-b9de-4c26-9efa-18c883301023';

    // Create Deployment Log database
    const deploymentDb = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: hubPageId,
      },
      title: [
        {
          type: 'text',
          text: {
            content: 'Deployment Log',
          },
        },
      ],
      properties: {
        Name: {
          title: {},
        },
        Version: {
          rich_text: {},
        },
        Date: {
          date: {},
        },
        Status: {
          select: {
            options: [
              { name: 'Success', color: 'green' },
              { name: 'Failed', color: 'red' },
              { name: 'In Progress', color: 'yellow' },
            ],
          },
        },
        Environment: {
          select: {
            options: [
              { name: 'Production', color: 'blue' },
              { name: 'Staging', color: 'purple' },
              { name: 'Development', color: 'gray' },
            ],
          },
        },
        'Deploy URL': {
          url: {},
        },
        Changes: {
          rich_text: {},
        },
        'Commit Hash': {
          rich_text: {},
        },
      },
    });

    // Create Feature Roadmap database
    const roadmapDb = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: hubPageId,
      },
      title: [
        {
          type: 'text',
          text: {
            content: 'Feature Roadmap',
          },
        },
      ],
      properties: {
        Name: {
          title: {},
        },
        Status: {
          select: {
            options: [
              { name: 'Planned', color: 'gray' },
              { name: 'In Progress', color: 'yellow' },
              { name: 'Completed', color: 'green' },
              { name: 'On Hold', color: 'red' },
            ],
          },
        },
        Priority: {
          select: {
            options: [
              { name: 'High', color: 'red' },
              { name: 'Medium', color: 'yellow' },
              { name: 'Low', color: 'gray' },
            ],
          },
        },
        Category: {
          select: {
            options: [
              { name: 'Feature', color: 'blue' },
              { name: 'Bug Fix', color: 'red' },
              { name: 'Enhancement', color: 'purple' },
              { name: 'Documentation', color: 'green' },
            ],
          },
        },
        'Target Date': {
          date: {},
        },
        'Completed Date': {
          date: {},
        },
        Description: {
          rich_text: {},
        },
      },
    });

    // Create Technical Documentation database
    const docsDb = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: hubPageId,
      },
      title: [
        {
          type: 'text',
          text: {
            content: 'Technical Documentation',
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
              { name: 'API', color: 'blue' },
              { name: 'Component', color: 'purple' },
              { name: 'Database', color: 'green' },
              { name: 'Configuration', color: 'yellow' },
              { name: 'Architecture', color: 'red' },
            ],
          },
        },
        'Last Updated': {
          date: {},
        },
        Status: {
          select: {
            options: [
              { name: 'Up to Date', color: 'green' },
              { name: 'Needs Update', color: 'yellow' },
              { name: 'Outdated', color: 'red' },
            ],
          },
        },
        Tags: {
          multi_select: {
            options: [
              { name: 'Frontend', color: 'blue' },
              { name: 'Backend', color: 'green' },
              { name: 'Database', color: 'purple' },
              { name: 'Auth', color: 'red' },
              { name: 'AI', color: 'yellow' },
            ],
          },
        },
        'File Path': {
          rich_text: {},
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notion databases created successfully',
      databases: {
        deploymentLog: {
          id: deploymentDb.id,
          url: deploymentDb.url,
        },
        featureRoadmap: {
          id: roadmapDb.id,
          url: roadmapDb.url,
        },
        technicalDocs: {
          id: docsDb.id,
          url: docsDb.url,
        },
      },
    });
  } catch (error: any) {
    console.error('Notion database creation error:', error);
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
