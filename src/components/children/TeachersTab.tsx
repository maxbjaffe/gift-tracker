/**
 * Teachers Tab Component
 * Manage teacher associations for a child
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Plus, Trash2, Mail, Phone, GraduationCap, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  name: string;
  email?: string;
  subject?: string;
  school?: string;
  phone?: string;
}

interface TeacherAssociation {
  id: string;
  teacher_id: string;
  subject?: string;
  is_primary: boolean;
  school_year: string;
  teacher: Teacher;
}

interface TeachersTabProps {
  childId: string;
  childName: string;
}

export function TeachersTab({ childId, childName }: TeachersTabProps) {
  const [associations, setAssociations] = useState<TeacherAssociation[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
    loadAssociations();
  }, [childId]);

  async function loadTeachers() {
    try {
      const response = await fetch('/api/teachers');
      const data = await response.json();

      if (response.ok) {
        setAllTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  }

  async function loadAssociations() {
    try {
      const response = await fetch(`/api/children/${childId}/teachers`);
      const data = await response.json();

      if (response.ok) {
        setAssociations(data.teachers || []);
      }
    } catch (error) {
      console.error('Error loading teacher associations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTeacher() {
    if (!selectedTeacher) {
      toast.error('Please select a teacher');
      return;
    }

    try {
      const response = await fetch(`/api/children/${childId}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: selectedTeacher,
          subject,
          is_primary: isPrimary,
        }),
      });

      if (response.ok) {
        toast.success('Teacher added successfully!');
        setShowAddForm(false);
        setSelectedTeacher('');
        setSubject('');
        setIsPrimary(false);
        loadAssociations();
      } else {
        toast.error('Failed to add teacher');
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast.error('Failed to add teacher');
    }
  }

  async function handleRemoveTeacher(associationId: string) {
    try {
      const response = await fetch(
        `/api/children/${childId}/teachers?association_id=${associationId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast.success('Teacher removed');
        loadAssociations();
      } else {
        toast.error('Failed to remove teacher');
      }
    } catch (error) {
      console.error('Error removing teacher:', error);
      toast.error('Failed to remove teacher');
    }
  }

  const availableTeachers = allTeachers.filter(
    t => !associations.some(a => a.teacher_id === t.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            {childName}'s Teachers
          </h3>
          <p className="text-sm text-gray-600">Manage teacher associations and contacts</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      {/* Add Teacher Form */}
      {showAddForm && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Teacher</label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="e.g., Math, English"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="isPrimary" className="text-sm text-gray-700">
                Primary/Homeroom Teacher
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddTeacher}>Add Teacher</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Teachers List */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading teachers...</div>
      ) : associations.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No teachers added yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add teachers to track their emails and contact information
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {associations.map(assoc => (
            <Card key={assoc.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {assoc.teacher.name}
                      {assoc.is_primary && (
                        <Badge className="bg-purple-100 text-purple-700">
                          <Star className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                    </h4>
                    {assoc.subject && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <GraduationCap className="h-3 w-3" />
                        {assoc.subject}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTeacher(assoc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  {assoc.teacher.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${assoc.teacher.email}`} className="hover:text-blue-600">
                        {assoc.teacher.email}
                      </a>
                    </div>
                  )}
                  {assoc.teacher.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${assoc.teacher.phone}`} className="hover:text-blue-600">
                        {assoc.teacher.phone}
                      </a>
                    </div>
                  )}
                  {assoc.teacher.school && (
                    <p className="text-gray-600">{assoc.teacher.school}</p>
                  )}
                </div>

                <Badge variant="outline" className="text-xs">
                  {assoc.school_year}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Add Teacher */}
      {availableTeachers.length === 0 && !showAddForm && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> Create teachers first in the{' '}
            <a href="/teachers" className="text-blue-600 hover:underline font-medium">
              main Teachers page
            </a>
            , then associate them with your children here.
          </p>
        </Card>
      )}
    </div>
  );
}
