import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { promises as fs } from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const ALLOWED_ADMIN = 'maxbjaffe@gmail.com';

// Ensure docs directory exists
async function ensureDocsDir() {
  try {
    await fs.access(DOCS_DIR);
  } catch {
    await fs.mkdir(DOCS_DIR, { recursive: true });
  }
}

// Check if user is admin
async function isAdmin(email: string | undefined): Promise<boolean> {
  return email === ALLOWED_ADMIN;
}

// GET - List all docs or get specific doc content
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await isAdmin(user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');

    await ensureDocsDir();

    if (filename) {
      // Get specific file content
      const filePath = path.join(DOCS_DIR, filename);

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

// POST - Create or update a doc
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await isAdmin(user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { filename, content } = await request.json();

    if (!filename || !filename.endsWith('.md')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    await ensureDocsDir();

    const filePath = path.join(DOCS_DIR, filename);
    await fs.writeFile(filePath, content, 'utf-8');

    return NextResponse.json({ success: true, filename });
  } catch (error: any) {
    console.error('Error in knowledge base POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a doc
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await isAdmin(user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');

    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    const filePath = path.join(DOCS_DIR, filename);
    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in knowledge base DELETE:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
