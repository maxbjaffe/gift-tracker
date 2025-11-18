/**
 * Interests & Activities Tab Component
 * Manage interests and activities for a child
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Plus, X, Trash2, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Activity {
  name: string;
  type: string; // sports, club, music, art, etc.
  season?: string;
  coach?: string;
  practice_schedule?: string;
}

interface InterestsTabProps {
  childId: string;
  childName: string;
  initialInterests?: string[];
  initialActivities?: Activity[];
}

export function InterestsTab({
  childId,
  childName,
  initialInterests = [],
  initialActivities = [],
}: InterestsTabProps) {
  const [interests, setInterests] = useState<string[]>(initialInterests);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [newInterest, setNewInterest] = useState('');
  const [newActivity, setNewActivity] = useState<Activity>({
    name: '',
    type: 'sports',
    season: '',
    coach: '',
    practice_schedule: '',
  });
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);

  async function saveInterests(updatedInterests: string[]) {
    try {
      const response = await fetch(`/api/children/${childId}/interests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: updatedInterests }),
      });

      if (!response.ok) {
        toast.error('Failed to save interests');
      }
    } catch (error) {
      console.error('Error saving interests:', error);
      toast.error('Failed to save interests');
    }
  }

  async function saveActivities(updatedActivities: Activity[]) {
    try {
      const response = await fetch(`/api/children/${childId}/interests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: updatedActivities }),
      });

      if (!response.ok) {
        toast.error('Failed to save activities');
      }
    } catch (error) {
      console.error('Error saving activities:', error);
      toast.error('Failed to save activities');
    }
  }

  function handleAddInterest() {
    if (!newInterest.trim()) return;

    const updated = [...interests, newInterest.trim()];
    setInterests(updated);
    setNewInterest('');
    saveInterests(updated);
    toast.success('Interest added!');
  }

  function handleRemoveInterest(interest: string) {
    const updated = interests.filter(i => i !== interest);
    setInterests(updated);
    saveInterests(updated);
    toast.success('Interest removed');
  }

  function handleAddActivity() {
    if (!newActivity.name.trim()) {
      toast.error('Activity name is required');
      return;
    }

    let updated: Activity[];
    if (editingActivityIndex !== null) {
      // Update existing
      updated = [...activities];
      updated[editingActivityIndex] = newActivity;
      toast.success('Activity updated!');
    } else {
      // Add new
      updated = [...activities, newActivity];
      toast.success('Activity added!');
    }

    setActivities(updated);
    saveActivities(updated);
    resetActivityForm();
  }

  function handleEditActivity(index: number) {
    setNewActivity(activities[index]);
    setEditingActivityIndex(index);
    setShowActivityForm(true);
  }

  function handleRemoveActivity(index: number) {
    const updated = activities.filter((_, i) => i !== index);
    setActivities(updated);
    saveActivities(updated);
    toast.success('Activity removed');
  }

  function resetActivityForm() {
    setNewActivity({
      name: '',
      type: 'sports',
      season: '',
      coach: '',
      practice_schedule: '',
    });
    setEditingActivityIndex(null);
    setShowActivityForm(false);
  }

  const activityTypeColors: Record<string, string> = {
    sports: 'bg-green-100 text-green-700 border-green-300',
    music: 'bg-purple-100 text-purple-700 border-purple-300',
    art: 'bg-pink-100 text-pink-700 border-pink-300',
    club: 'bg-blue-100 text-blue-700 border-blue-300',
    academic: 'bg-orange-100 text-orange-700 border-orange-300',
    other: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  return (
    <div className="space-y-6">
      {/* Interests Section */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Interests & Hobbies
        </h3>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add an interest (e.g., math, soccer, art)"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
          />
          <Button onClick={handleAddInterest}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {interests.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {interests.map((interest, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 pl-3 pr-1 py-1"
              >
                {interest}
                <button
                  onClick={() => handleRemoveInterest(interest)}
                  className="ml-2 hover:bg-red-200 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No interests added yet. Add tags to track {childName}'s hobbies!
          </p>
        )}
      </Card>

      {/* Activities Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Activities & Sports</h3>
          <Button onClick={() => setShowActivityForm(!showActivityForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>

        {/* Activity Form */}
        {showActivityForm && (
          <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Activity Name *</label>
                  <Input
                    placeholder="e.g., Soccer"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                  >
                    <option value="sports">Sports</option>
                    <option value="music">Music</option>
                    <option value="art">Art</option>
                    <option value="club">Club</option>
                    <option value="academic">Academic</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Season/Year</label>
                  <Input
                    placeholder="e.g., Fall 2024"
                    value={newActivity.season || ''}
                    onChange={(e) => setNewActivity({ ...newActivity, season: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Coach/Instructor</label>
                  <Input
                    placeholder="e.g., Coach Smith"
                    value={newActivity.coach || ''}
                    onChange={(e) => setNewActivity({ ...newActivity, coach: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Schedule</label>
                  <Input
                    placeholder="e.g., Tuesdays & Thursdays 4-5pm"
                    value={newActivity.practice_schedule || ''}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, practice_schedule: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddActivity}>
                  <Check className="h-4 w-4 mr-2" />
                  {editingActivityIndex !== null ? 'Update' : 'Add'} Activity
                </Button>
                <Button variant="outline" onClick={resetActivityForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Activities List */}
        {activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((activity, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                      <Badge
                        variant="outline"
                        className={activityTypeColors[activity.type] || activityTypeColors.other}
                      >
                        {activity.type}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditActivity(index)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveActivity(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    {activity.season && (
                      <p>
                        <strong>Season:</strong> {activity.season}
                      </p>
                    )}
                    {activity.coach && (
                      <p>
                        <strong>Coach:</strong> {activity.coach}
                      </p>
                    )}
                    {activity.practice_schedule && (
                      <p>
                        <strong>Schedule:</strong> {activity.practice_schedule}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-8">
            No activities added yet. Track {childName}'s sports, clubs, and extracurriculars!
          </p>
        )}
      </Card>
    </div>
  );
}
