'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  MessageSquare,
  Upload,
  Search,
  Filter,
  Plus,
  Loader2,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { QuickAddModal } from '@/components/family-info/QuickAddModal';

interface FamilyInfo {
  id: string;
  title: string;
  type: string;
  description: string;
  details: string;
  tags: string[];
  status: string;
  created_at: string;
}

export default function FamilyInfoPage() {
  const [entries, setEntries] = useState<FamilyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const types = [
    'Insurance',
    'Contact',
    'Financial',
    'Healthcare',
    'Education',
    'Home',
    'Auto',
    'Legal',
    'Other',
  ];

  useEffect(() => {
    loadEntries();
  }, [filterType]);

  // Keyboard shortcut for Quick Add (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickAddOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/family-info?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEntries(data.entries || []);
      } else {
        toast.error('Failed to load family information');
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Failed to load family information');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEntries();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Insurance: 'bg-blue-100 text-blue-800 border-blue-300',
      Contact: 'bg-green-100 text-green-800 border-green-300',
      Financial: 'bg-purple-100 text-purple-800 border-purple-300',
      Healthcare: 'bg-red-100 text-red-800 border-red-300',
      Education: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Home: 'bg-pink-100 text-pink-800 border-pink-300',
      Auto: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      Legal: 'bg-gray-100 text-gray-800 border-gray-300',
      Other: 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[type] || colors.Other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Family Information Hub
          </h1>
          <p className="text-gray-600">
            Manage important family documents, contacts, and information
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/family-info/chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 hover:border-purple-400">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Chat Assistant</h3>
                  <p className="text-sm text-gray-600">Ask questions about your info</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/family-info/upload">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 hover:border-blue-400">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Upload Document</h3>
                  <p className="text-sm text-gray-600">Extract info from files</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-yellow-200 hover:border-yellow-400"
            onClick={() => setQuickAddOpen(true)}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  Quick Add
                  <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border">⌘K</kbd>
                </h3>
                <p className="text-sm text-gray-600">Fast entry with templates</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search family information..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border rounded-md bg-white text-sm"
              >
                <option value="">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <Button type="submit">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Entries List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No information yet</h3>
              <p className="text-gray-600 mb-4">
                Start by adding family information or uploading documents
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/family-info/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </Link>
                <Link href="/family-info/upload">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <Link key={entry.id} href={`/family-info/${entry.id}`}>
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 border ${getTypeColor(
                            entry.type
                          )}`}
                        >
                          {entry.type}
                        </div>
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {entry.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {entry.description}
                      </p>
                    )}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="px-2 py-0.5 text-gray-500 text-xs">
                            +{entry.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Floating Quick Add Button */}
        <button
          onClick={() => setQuickAddOpen(true)}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all z-50 group"
          aria-label="Quick Add"
        >
          <Zap className="h-6 w-6" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Quick Add (⌘K)
          </span>
        </button>

        {/* Quick Add Modal */}
        <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
      </div>
    </div>
  );
}
