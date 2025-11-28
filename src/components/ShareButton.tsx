// Component for sharing a recipient's gift list
'use client';

import { useState } from 'react';
import { Database } from '@/types/database.types';
import { logger } from '@/lib/logger';

type Recipient = Database['public']['Tables']['recipients']['Row'];

interface ShareButtonProps {
  recipient: Recipient;
  onShareUpdated?: () => void;
}

export function ShareButton({ recipient, onShareUpdated }: ShareButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareInfo, setShareInfo] = useState<{
    shareUrl: string | null;
    isEnabled: boolean;
    viewCount: number;
  }>({
    shareUrl: null,
    isEnabled: recipient.share_enabled || false,
    viewCount: recipient.share_view_count || 0,
  });
  const [privacy, setPrivacy] = useState<'private' | 'link-only' | 'public'>(
    (recipient.share_privacy as 'private' | 'link-only' | 'public') || 'link-only'
  );

  async function enableSharing() {
    setLoading(true);
    try {
      const response = await fetch(`/api/recipients/${recipient.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacy, expiresInDays: null }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to enable sharing');
        return;
      }

      setShareInfo({
        shareUrl: data.shareUrl,
        isEnabled: true,
        viewCount: 0,
      });

      onShareUpdated?.();
    } catch (error) {
      logger.error('Error enabling sharing:', error);
      alert('An error occurred while enabling sharing');
    } finally {
      setLoading(false);
    }
  }

  async function disableSharing() {
    if (!confirm('Are you sure you want to stop sharing this gift list?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/recipients/${recipient.id}/share`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to disable sharing');
        return;
      }

      setShareInfo({
        shareUrl: null,
        isEnabled: false,
        viewCount: shareInfo.viewCount,
      });

      onShareUpdated?.();
    } catch (error) {
      logger.error('Error disabling sharing:', error);
      alert('An error occurred while disabling sharing');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (shareInfo.shareUrl) {
      navigator.clipboard.writeText(shareInfo.shareUrl);
      alert('Link copied to clipboard!');
    }
  }

  // Build share URL from token if enabled
  const shareUrl = shareInfo.shareUrl ||
    (shareInfo.isEnabled && recipient.share_token
      ? `${window.location.origin}/share/${recipient.share_token}`
      : null);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
      >
        <span>🔗</span>
        <span>Share</span>
        {shareInfo.isEnabled && (
          <span className="bg-purple-800 px-2 py-0.5 rounded-full text-xs">
            {shareInfo.viewCount} views
          </span>
        )}
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Share Gift List
              </h2>
              <button
                onClick={() => setShowDialog(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {shareInfo.isEnabled && shareUrl ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2 font-semibold">
                    ✅ Sharing is enabled
                  </p>
                  <p className="text-xs text-green-700">
                    Anyone with this link can view {recipient.name}&apos;s gift list and reserve items
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shareable Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <p>📊 Views: {shareInfo.viewCount}</p>
                  <p>🔒 Privacy: {privacy === 'link-only' ? 'Link Only' : privacy === 'public' ? 'Public' : 'Private'}</p>
                </div>

                <button
                  onClick={disableSharing}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Disabling...' : 'Stop Sharing'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Share {recipient.name}&apos;s gift list with family and friends. They can view the list and reserve items to avoid duplicate gifts.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Level
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as 'private' | 'link-only' | 'public')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="link-only">Link Only (Recommended)</option>
                    <option value="public">Public (Discoverable)</option>
                    <option value="private">Private (No Sharing)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {privacy === 'link-only' && 'Only people with the link can access'}
                    {privacy === 'public' && 'List may be discoverable by others'}
                    {privacy === 'private' && 'List is completely private'}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-semibold mb-1">Features:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>✓ No login required for viewers</li>
                    <li>✓ Prevent duplicate gifts with reservations</li>
                    <li>✓ Track views anonymously</li>
                    <li>✓ Your personal info stays private</li>
                  </ul>
                </div>

                <button
                  onClick={enableSharing}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50"
                >
                  {loading ? 'Enabling...' : 'Enable Sharing'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
