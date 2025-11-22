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
  ChevronDown,
  ChevronRight,
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
  const typeInfo: Record<string, { icon: string; color: string; description: string }> = {
    Insurance: { icon: '🛡️', color: 'blue', description: 'Coverage & policies' },
    Contact: { icon: '📞', color: 'green', description: 'Important contacts' },
    Financial: { icon: '💰', color: 'purple', description: 'Accounts & investments' },
    Healthcare: { icon: '🏥', color: 'red', description: 'Medical providers' },
    Education: { icon: '🎓', color: 'yellow', description: 'Schools & programs' },
    Home: { icon: '🏠', color: 'pink', description: 'Property & utilities' },
    Auto: { icon: '🚗', color: 'orange', description: 'Vehicles & registration' },
    Legal: { icon: '⚖️', color: 'gray', description: 'Documents & estate' },
    Other: { icon: '📋', color: 'slate', description: 'General information' },
  };

  const types = Object.keys(typeInfo);

  const [entries, setEntries] = useState<FamilyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (type: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedCategories(newExpanded);
  };

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

        {/* Entries List - Organized by Category */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : entries.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No information yet</h3>
              <p className="text-gray-600 mb-4">
                Start by adding family information or uploading documents
              </p>
              <Button onClick={() => setQuickAddOpen(true)} size="lg">
                <Zap className="h-4 w-4 mr-2" />
                Quick Add Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {types
              .map((type) => ({
                type,
                entries: entries.filter((e) => e.type === type),
              }))
              .filter(({ entries }) => entries.length > 0)
              .map(({ type, entries: typeEntries }) => {
                const isExpanded = expandedCategories.has(type);
                const info = typeInfo[type];

                return (
                  <Card key={type} className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow h-fit">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(type)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{info.icon}</div>
                        <div className="text-left">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-gray-900">{type}</h3>
                            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                              {typeEntries.length}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{info.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Category Items */}
                    {isExpanded && (
                      <div className="px-6 pb-4 space-y-2">
                        <div className="border-t pt-4">
                          {typeEntries.map((entry) => (
                            <Link key={entry.id} href={`/family-info/${entry.id}`}>
                              <div className="p-4 rounded-lg hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200 group">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                      {entry.title}
                                    </h4>
                                    {entry.description && (
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                        {entry.description}
                                      </p>
                                    )}
                                    {entry.tags && entry.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {entry.tags.slice(0, 4).map((tag) => (
                                          <span
                                            key={tag}
                                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                        {entry.tags.length > 4 && (
                                          <span className="px-2 py-0.5 text-gray-400 text-xs">
                                            +{entry.tags.length - 4}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4 text-xs text-gray-400">
                                    {new Date(entry.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
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
