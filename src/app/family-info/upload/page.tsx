'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function FamilyInfoUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [autoCreate, setAutoCreate] = useState(true);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload PDF or image files.');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    setExtractedData(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setExtractedData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('autoCreate', autoCreate.toString());

      const response = await fetch('/api/family-info/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setExtractedData(data.extractedData);
        toast.success(
          autoCreate
            ? 'Document processed and entry created!'
            : 'Document processed successfully!'
        );

        if (autoCreate && data.familyInfoId) {
          setTimeout(() => {
            router.push(`/family-info/${data.familyInfoId}`);
          }, 2000);
        }
      } else {
        toast.error(data.error || 'Failed to process document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/family-info">
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Upload Document
            </h1>
            <p className="text-gray-600 text-sm">
              Extract information from PDFs and images using AI
            </p>
          </div>
        </div>

        {/* Upload Card */}
        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <File className="h-12 w-12 text-purple-600" />
                    <div className="text-left">
                      <p className="font-semibold text-lg">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setFile(null)}
                    disabled={uploading}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold mb-2">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported: PDF, JPG, PNG, WebP, GIF (max 50MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) handleFileSelect(selectedFile);
                    }}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span className="cursor-pointer">Browse Files</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <input
                type="checkbox"
                id="auto-create"
                checked={autoCreate}
                onChange={(e) => setAutoCreate(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
                disabled={uploading}
              />
              <label htmlFor="auto-create" className="text-sm font-medium">
                Automatically create family info entry from extracted data
              </label>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing Document...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Upload and Extract
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Extracted Data Preview */}
        {extractedData && (
          <Card className="shadow-xl border-2 border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <span>Extracted Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Type</label>
                  <p className="text-lg">{extractedData.type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Title</label>
                  <p className="text-lg">{extractedData.title || 'N/A'}</p>
                </div>
              </div>

              {extractedData.description && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Description</label>
                  <p className="text-gray-800">{extractedData.description}</p>
                </div>
              )}

              {extractedData.details && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Details</label>
                  <div className="bg-gray-50 p-4 rounded-lg mt-1">
                    <pre className="whitespace-pre-wrap text-sm">
                      {extractedData.details}
                    </pre>
                  </div>
                </div>
              )}

              {extractedData.tags && extractedData.tags.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {extractedData.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {autoCreate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ✓ Family info entry created! Redirecting to view page...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              How it works
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Upload insurance cards, bills, medical records, or documents</li>
              <li>• AI extracts key information (policy numbers, dates, contacts, etc.)</li>
              <li>• Review extracted data before saving</li>
              <li>• Enable auto-create to instantly add to your family info database</li>
              <li>• Supports PDFs and image files (JPG, PNG, WebP, GIF)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
