'use client';

import { useState, useEffect } from 'react';
import { GiftStashNav } from '@/components/GiftStashNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BookOpen, FileText, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function HelpPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Load file list
  useEffect(() => {
    loadFiles();
  }, []);

  // Load README.md by default when files are loaded
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      const readme = files.find(f => f.toLowerCase() === 'readme.md');
      if (readme) {
        setSelectedFile(readme);
      } else {
        setSelectedFile(files[0]);
      }
    }
  }, [files, selectedFile]);

  // Load specific file content
  useEffect(() => {
    if (selectedFile) {
      loadFileContent(selectedFile);
    }
  }, [selectedFile]);

  async function loadFiles() {
    try {
      const response = await fetch('/api/knowledge-base');
      if (!response.ok) throw new Error('Failed to load files');
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
      const response = await fetch(`/api/knowledge-base?file=${encodeURIComponent(filename)}`);
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

  // Format filename for display
  function formatFilename(filename: string): string {
    return filename
      .replace('.md', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <>
      <GiftStashNav />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Help & Documentation
              </h1>
            </div>
            <p className="text-gray-600">
              Learn everything about GiftStash - features, guides, and tips
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - File List */}
            <Card className="p-4 lg:col-span-1 h-fit">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentation
              </h3>

              {/* File List */}
              <div className="space-y-1">
                {files.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No documentation available yet.
                  </p>
                ) : (
                  files.map((file) => (
                    <Button
                      key={file}
                      variant={selectedFile === file ? 'default' : 'ghost'}
                      className={`w-full justify-between text-left ${
                        selectedFile === file
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'text-gray-700 hover:bg-purple-50'
                      }`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <span className="truncate">{formatFilename(file)}</span>
                      {selectedFile === file && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                    </Button>
                  ))
                )}
              </div>
            </Card>

            {/* Content Area */}
            <Card className="p-6 lg:col-span-3">
              {selectedFile ? (
                <>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {formatFilename(selectedFile)}
                    </h2>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <div className="prose prose-purple max-w-none">
                      <ReactMarkdown
                        components={{
                          // Style headings
                          h1: ({ node, ...props }) => (
                            <h1 className="text-3xl font-bold mb-4 text-gray-900" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-2xl font-bold mt-8 mb-3 text-gray-900" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-900" {...props} />
                          ),
                          // Style links
                          a: ({ node, ...props }) => (
                            <a
                              className="text-purple-600 hover:text-purple-700 underline"
                              target={props.href?.startsWith('http') ? '_blank' : undefined}
                              rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                              {...props}
                            />
                          ),
                          // Style code blocks
                          code: ({ node, className, children, ...props }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code
                                className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-sm font-mono"
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <code
                                className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          // Style lists
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc list-inside space-y-2 my-4" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal list-inside space-y-2 my-4" {...props} />
                          ),
                          // Style paragraphs
                          p: ({ node, ...props }) => (
                            <p className="my-4 leading-relaxed text-gray-700" {...props} />
                          ),
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
                  <BookOpen className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg">Select a documentation topic to view</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
