'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Tag,
  RefreshCw,
  Loader2,
  AlertCircle,
  Shield,
  Clock,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface FamilyInfo {
  id: string;
  title: string;
  type: string;
  description: string;
  details: string;
  tags: string[];
  important_dates: Record<string, string>;
  status: string;
  security_level: string;
  created_at: string;
  updated_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  Insurance: 'bg-blue-100 text-blue-800 border-blue-300',
  Contact: 'bg-green-100 text-green-800 border-green-300',
  Financial: 'bg-purple-100 text-purple-800 border-purple-300',
  Healthcare: 'bg-red-100 text-red-800 border-red-300',
  Education: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Home: 'bg-pink-100 text-pink-800 border-pink-300',
  Auto: 'bg-orange-100 text-orange-800 border-orange-300',
  Legal: 'bg-gray-100 text-gray-800 border-gray-300',
  Other: 'bg-slate-100 text-slate-800 border-slate-300',
};

const TYPE_ICONS: Record<string, string> = {
  Insurance: '🛡️',
  Contact: '📞',
  Financial: '💰',
  Healthcare: '🏥',
  Education: '🎓',
  Home: '🏠',
  Auto: '🚗',
  Legal: '⚖️',
  Other: '📋',
};

function FamilyInfoKioskContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || null;

  const [entries, setEntries] = useState<FamilyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<FamilyInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!token) {
      setError('No kiosk token provided in URL');
      setLoading(false);
      return;
    }

    loadData();

    // Auto-refresh every 5 minutes
    const refreshInterval = setInterval(loadData, 5 * 60 * 1000);

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(timeInterval);
    };
  }, [token]);

  async function loadData() {
    try {
      if (!token) return;

      const response = await fetch(`/api/kiosk/family-info?token=${encodeURIComponent(token)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load' }));
        setError(errorData.error || `Failed to load (${response.status})`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setEntries(data.entries || []);
      setError(null);
    } catch (error) {
      console.error('Error loading family info:', error);
      setError(`Failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please use the kiosk URL from your account settings.
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  // Group entries by type
  const entriesByType = entries.reduce((acc, entry) => {
    if (!acc[entry.type]) {
      acc[entry.type] = [];
    }
    acc[entry.type].push(entry);
    return acc;
  }, {} as Record<string, FamilyInfo[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Family Information Hub
              </h1>
              <p className="text-gray-600 mt-2 text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {currentTime.toLocaleString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mt-4">
            <div className="px-4 py-2 bg-white rounded-lg shadow border-2 border-purple-200">
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-purple-600">{entries.length}</p>
            </div>
            <div className="px-4 py-2 bg-white rounded-lg shadow border-2 border-pink-200">
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-pink-600">
                {Object.keys(entriesByType).length}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {entries.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 font-semibold">
              No family information entries yet
            </p>
          </Card>
        ) : selectedEntry ? (
          /* Detail View */
          <Card className="shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{TYPE_ICONS[selectedEntry.type] || '📋'}</span>
                  <div>
                    <div className="inline-block px-3 py-1 rounded text-sm font-semibold mb-2 bg-white/20 border border-white/40">
                      {selectedEntry.type}
                    </div>
                    <CardTitle className="text-3xl">{selectedEntry.title}</CardTitle>
                    {selectedEntry.description && (
                      <p className="text-purple-100 mt-1">{selectedEntry.description}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEntry(null)}
                  className="bg-white text-purple-600 hover:bg-purple-50"
                >
                  Back to List
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {selectedEntry.details && (
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 prose prose-sm max-w-none">
                    <ReactMarkdown>{selectedEntry.details}</ReactMarkdown>
                  </div>
                </div>
              )}

              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                    <Tag className="h-5 w-5 text-purple-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm border border-purple-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Status
                  </p>
                  <p className="font-semibold capitalize">{selectedEntry.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Security Level
                  </p>
                  <p className="font-semibold capitalize">{selectedEntry.security_level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold">
                    {new Date(selectedEntry.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-semibold">
                    {new Date(selectedEntry.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* List View - Grouped by Type */
          <div className="space-y-6">
            {Object.entries(entriesByType)
              .sort(([typeA], [typeB]) => typeA.localeCompare(typeB))
              .map(([type, typeEntries]) => (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">{TYPE_ICONS[type] || '📋'}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{type}</h2>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                      {typeEntries.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeEntries.map((entry) => (
                      <Card
                        key={entry.id}
                        className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <CardHeader>
                          <div
                            className={`inline-block px-3 py-1 rounded text-xs font-semibold mb-2 border-2 ${
                              TYPE_COLORS[entry.type] || TYPE_COLORS.Other
                            }`}
                          >
                            {entry.type}
                          </div>
                          <CardTitle className="text-lg">{entry.title}</CardTitle>
                          {entry.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {entry.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {entry.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                              {entry.tags.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                  +{entry.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                            Updated {new Date(entry.updated_at).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FamilyInfoKioskPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      }
    >
      <FamilyInfoKioskContent />
    </Suspense>
  );
}
