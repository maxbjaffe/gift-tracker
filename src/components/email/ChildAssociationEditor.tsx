/**
 * Child Association Editor Component
 * Edit which children are associated with an email
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Plus, X, Check, Brain } from 'lucide-react';
import { toast } from 'sonner';

interface Child {
  id: string;
  name: string;
}

interface ChildRelevance {
  id: string;
  child_id: string;
  child?: Child;
  relevance_type: 'primary' | 'mentioned' | 'shared' | 'class_wide';
  ai_confidence?: number;
  ai_reasoning?: string;
  is_verified: boolean;
  is_rejected: boolean;
}

interface ChildAssociationEditorProps {
  emailId: string;
  userId: string;
  associations: ChildRelevance[];
  onUpdate: () => void;
}

export function ChildAssociationEditor({
  emailId,
  userId,
  associations,
  onUpdate,
}: ChildAssociationEditorProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [relevanceType, setRelevanceType] = useState<string>('primary');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    try {
      const response = await fetch('/api/accountability/children');
      const data = await response.json();
      if (response.ok) {
        setChildren(data.children || []);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    }
  }

  async function handleAddAssociation() {
    if (!selectedChild) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/email/associations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_id: emailId,
          child_id: selectedChild,
          relevance_type: relevanceType,
        }),
      });

      if (response.ok) {
        toast.success('Association added');
        setShowAddForm(false);
        setSelectedChild('');
        onUpdate();
      } else {
        toast.error('Failed to add association');
      }
    } catch (error) {
      console.error('Error adding association:', error);
      toast.error('Failed to add association');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveAssociation(associationId: string) {
    try {
      const response = await fetch(`/api/email/associations/${associationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Association removed');
        onUpdate();
      } else {
        toast.error('Failed to remove association');
      }
    } catch (error) {
      console.error('Error removing association:', error);
      toast.error('Failed to remove association');
    }
  }

  async function handleVerify(associationId: string, verify: boolean) {
    try {
      const response = await fetch(`/api/email/associations/${associationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_verified: verify,
          is_rejected: !verify,
        }),
      });

      if (response.ok) {
        toast.success(verify ? 'Association verified' : 'Association rejected');
        onUpdate();
      } else {
        toast.error('Failed to update association');
      }
    } catch (error) {
      console.error('Error updating association:', error);
      toast.error('Failed to update association');
    }
  }

  const getRelevanceColor = (type: string) => {
    switch (type) {
      case 'primary':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'mentioned':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'shared':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'class_wide':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Filter out already associated children
  const availableChildren = children.filter(
    child => !associations.some(assoc => assoc.child_id === child.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-4 w-4" />
          Related Children
        </h3>
        {availableChildren.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Child
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  {availableChildren.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={relevanceType} onValueChange={setRelevanceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="mentioned">Mentioned</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="class_wide">Class Wide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddAssociation} disabled={!selectedChild || loading}>
                Add
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Associations List */}
      {associations.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No children associated with this email</p>
      ) : (
        <div className="space-y-2">
          {associations.map(assoc => (
            <Card
              key={assoc.id}
              className={`p-3 ${
                assoc.is_verified
                  ? 'bg-green-50 border-green-200'
                  : assoc.is_rejected
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{assoc.child?.name || 'Unknown'}</span>
                    <Badge variant="outline" className={getRelevanceColor(assoc.relevance_type)}>
                      {assoc.relevance_type}
                    </Badge>
                    {assoc.ai_confidence !== undefined && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600">
                        <Brain className="h-3 w-3 mr-1" />
                        {Math.round(assoc.ai_confidence * 100)}%
                      </Badge>
                    )}
                    {assoc.is_verified && (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  {assoc.ai_reasoning && (
                    <p className="text-xs text-gray-600">{assoc.ai_reasoning}</p>
                  )}
                </div>

                <div className="flex gap-1 shrink-0">
                  {!assoc.is_verified && !assoc.is_rejected && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(assoc.id, true)}
                        title="Verify association"
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(assoc.id, false)}
                        title="Reject association"
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveAssociation(assoc.id)}
                    title="Remove association"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
