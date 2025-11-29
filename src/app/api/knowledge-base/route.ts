import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');

// Ensure docs directory exists
async function ensureDocsDir() {
  try {
    await fs.access(DOCS_DIR);
  } catch {
    await fs.mkdir(DOCS_DIR, { recursive: true });
  }
}

// GET - Public read-only access to docs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');

    await ensureDocsDir();

    if (filename) {
      // Get specific file content
      const filePath = path.join(DOCS_DIR, filename);

      // Security: prevent directory traversal
      if (!filePath.startsWith(DOCS_DIR)) {
        return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
      }

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return NextResponse.json({ filename, content });
      } catch (error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
    } else {
      // List all docs
      const files = await fs.readdir(DOCS_DIR);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      return NextResponse.json({ files: mdFiles });
    }
  } catch (error: any) {
    console.error('Error in knowledge base GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
