'use client';

import { useState, useEffect } from 'react';
import { GiftStashNav } from '@/components/GiftStashNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Book, Save, Plus, Trash2, FileText, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Load file list
  useEffect(() => {
    loadFiles();
  }, []);

  // Load specific file content
  useEffect(() => {
    if (selectedFile) {
      loadFileContent(selectedFile);
    }
  }, [selectedFile]);

  async function loadFiles() {
    try {
      const response = await fetch('/api/admin/knowledge-base');
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Access denied. Admin only.');
          return;
        }
        throw new Error('Failed to load files');
      }
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load documentation files');
    }
  }

  async function loadFileContent(filename: string) {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/knowledge-base?file=${encodeURIComponent(filename)}`);
      if (!response.ok) throw new Error('Failed to load file');
      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error('Error loading file content:', error);
      toast.error('Failed to load file content');
    } finally {
      setLoading(false);
    }
  }

  async function saveFile() {
    if (!selectedFile) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile,
          content,
        }),
      });

      if (!response.ok) throw new Error('Failed to save file');

      toast.success('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('Failed to save file');
    } finally {
      setLoading(false);
    }
  }

  async function createNewFile() {
    if (!newFileName.trim()) {
      toast.error('Please enter a filename');
      return;
    }

    const filename = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content: `# ${newFileName.replace('.md', '')}\n\nEnter content here...`,
        }),
      });

      if (!response.ok) throw new Error('Failed to create file');

      toast.success('File created successfully');
      setNewFileName('');
      await loadFiles();
      setSelectedFile(filename);
    } catch (error) {
      console.error('Error creating file:', error);
      toast.error('Failed to create file');
    } finally {
      setLoading(false);
    }
  }

  async function deleteFile(filename: string) {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/knowledge-base?file=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete file');

      toast.success('File deleted successfully');
      if (selectedFile === filename) {
        setSelectedFile(null);
        setContent('');
      }
      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <GiftStashNav />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Book className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Knowledge Base Admin
              </h1>
            </div>
            <p className="text-gray-600">
              Create and edit comprehensive documentation for GiftStash
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - File List */}
            <Card className="p-4 lg:col-span-1">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentation Files
                </h3>

                {/* Create New File */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="new-doc.md"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createNewFile()}
                  />
                  <Button size="sm" onClick={createNewFile} disabled={loading}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* File List */}
              <div className="space-y-1">
                {files.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No files yet. Create one above!
                  </p>
                ) : (
                  files.map((file) => (
                    <div
                      key={file}
                      className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors ${
                        selectedFile === file ? 'bg-purple-100 hover:bg-purple-100' : ''
                      }`}
                    >
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="flex-1 text-left text-sm truncate"
                      >
                        {file}
                      </button>
                      <button
                        onClick={() => deleteFile(file)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Editor */}
            <Card className="p-6 lg:col-span-3">
              {selectedFile ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedFile}
                    </h2>
                    <Button onClick={saveFile} disabled={loading} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>

                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="edit" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Edit
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit">
                      <textarea
                        className="w-full h-[600px] p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter markdown content..."
                      />
                    </TabsContent>

                    <TabsContent value="preview">
                      <div className="prose max-w-none p-4 border rounded-lg bg-white h-[600px] overflow-y-auto">
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
                  <FileText className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg">Select a file to edit or create a new one</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
