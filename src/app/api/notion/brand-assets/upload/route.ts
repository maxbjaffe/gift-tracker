import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    const body = await request.json();
    const { scanDirectory = false } = body;

    const databaseId = process.env.NOTION_BRAND_ASSETS_DB;

    if (!databaseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Brand Assets database not configured. Please run /api/notion/brand-assets/setup first.',
        },
        { status: 404 }
      );
    }

    const uploadedAssets = [];

    if (scanDirectory) {
      // Scan and upload all brand assets from the project
      const assets = [
        // Avatars
        ...fs.readdirSync(path.join(process.cwd(), 'public/avatars'))
          .filter(f => f.endsWith('.png'))
          .map(f => ({
            name: f.replace('.png', '').replace(/-/g, ' '),
            type: 'Avatar',
            filePath: `/avatars/${f}`,
            fileUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/avatars/${f}`,
            useCase: 'User profile avatars for gift recipients',
            tags: ['GiftStash', 'Primary'],
          })),

        // Logos
        ...fs.readdirSync(path.join(process.cwd(), 'public/images'))
          .filter(f => f.includes('Logo') || f.includes('logo'))
          .map(f => ({
            name: f.replace(/\.(png|jpg|jpeg|svg)$/i, '').replace(/-/g, ' '),
            type: 'Logo',
            filePath: `/images/${f}`,
            fileUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/${f}`,
            useCase: 'Brand logo for GiftStash application',
            tags: ['GiftStash', 'Primary'],
          })),

        // Icons
        ...fs.readdirSync(path.join(process.cwd(), 'public/images'))
          .filter(f => f.includes('Icon') || f.includes('icon'))
          .map(f => ({
            name: f.replace(/\.(png|jpg|jpeg|svg)$/i, '').replace(/-/g, ' '),
            type: 'Icon',
            filePath: `/images/${f}`,
            fileUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/${f}`,
            useCase: 'App icons and branding',
            tags: ['GiftStash', 'App Icon'],
          })),
      ];

      // Upload each asset to Notion
      for (const asset of assets) {
        const page = await notion.pages.create({
          parent: {
            database_id: databaseId,
          },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: asset.name,
                  },
                },
              ],
            },
            Type: {
              select: {
                name: asset.type,
              },
            },
            'File Path': {
              rich_text: [
                {
                  text: {
                    content: asset.filePath,
                  },
                },
              ],
            },
            'File URL': {
              url: asset.fileUrl,
            },
            'Use Case': {
              rich_text: [
                {
                  text: {
                    content: asset.useCase,
                  },
                },
              ],
            },
            'Date Added': {
              date: {
                start: new Date().toISOString(),
              },
            },
            Status: {
              select: {
                name: 'Active',
              },
            },
            Tags: {
              multi_select: asset.tags.map(tag => ({ name: tag })),
            },
          },
        });

        uploadedAssets.push({
          name: asset.name,
          pageId: page.id,
          pageUrl: page.url,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${uploadedAssets.length} brand assets to Notion`,
      assets: uploadedAssets,
    });
  } catch (error: any) {
    console.error('Notion brand assets upload error:', error);
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
