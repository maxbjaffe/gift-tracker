'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Recipient = {
  id: string;
  name: string;
  relationship: string | null;
  birthday: string | null;
  age_range: string | null;
  interests: any;
};

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipients();
  }, []);

  async function fetchRecipients() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching recipients:', error);
      } else {
        setRecipients(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatInterests = (interests: any) => {
    if (!interests) return null;
    if (Array.isArray(interests)) {
      return interests.join(', ');
    }
    return String(interests);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recipients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <span className="text-4xl">👥</span>
              Recipients
            </h1>
            <p className="text-gray-600">
              Manage the people you're buying gifts for
            </p>
          </div>
          <Link
            href="/recipients/new"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            + Add Recipient
          </Link>
        </div>

        {recipients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No recipients yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start by adding someone you'd like to track gifts for
            </p>
            <Link
              href="/recipients/new"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Add Your First Recipient
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipients.map((recipient) => (
              <Link
                key={recipient.id}
                href={`/recipients/${recipient.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 group hover:scale-105 duration-300"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold">
                    {getInitials(recipient.name)}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {recipient.name}
                </h2>

                {recipient.relationship && (
                  <p className="text-center text-gray-600 mb-4">
                    {recipient.relationship}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {recipient.age_range && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span>🎂</span>
                      <span>Age: {recipient.age_range}</span>
                    </div>
                  )}

                  {recipient.interests && (
                    <div className="flex items-start gap-2 text-gray-700">
                      <span className="mt-0.5">🎨</span>
                      <span className="flex-1">{formatInterests(recipient.interests)}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}