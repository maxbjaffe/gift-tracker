/**
 * Teachers Management Page
 * Manage all teachers in one place
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  Mail,
  Phone,
  School,
  Edit2,
  Trash2,
  X,
  Check,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Teacher {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  school?: string;
  notes?: string;
  created_at: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    school: '',
    notes: '',
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    try {
      const response = await fetch('/api/teachers');
      const data = await response.json();

      if (response.ok) {
        setTeachers(data.teachers || []);
      } else {
        toast.error('Failed to load teachers');
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Teacher name is required');
      return;
    }

    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingId ? 'Teacher updated!' : 'Teacher added!');
        resetForm();
        loadTeachers();
      } else {
        toast.error('Failed to save teacher');
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast.error('Failed to save teacher');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      const response = await fetch(`/api/teachers?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Teacher deleted');
        loadTeachers();
      } else {
        toast.error('Failed to delete teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Failed to delete teacher');
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      school: '',
      notes: '',
    });
    setShowAddForm(false);
    setEditingId(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading teachers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Users className="h-10 w-10 text-blue-600" />
                Teachers
              </h1>
              <p className="text-gray-600">
                Manage your teachers and associate them with your kids
              </p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </div>

          {/* Quick Links */}
          <div className="flex gap-2">
            <Link href="/children">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Go to Kids
              </Button>
            </Link>
            <Link href="/emails">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Go to Emails
              </Button>
            </Link>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {editingId ? 'Edit Teacher' : 'Add New Teacher'}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name *</label>
                  <Input
                    placeholder="e.g., Mrs. Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    type="email"
                    placeholder="teacher@school.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Subject</label>
                  <Input
                    placeholder="e.g., Math, English"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">School</label>
                  <Input
                    placeholder="e.g., Lincoln Elementary"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Notes</label>
                  <Input
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Check className="h-4 w-4 mr-2" />
                  {editingId ? 'Update Teacher' : 'Add Teacher'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Teachers List */}
        {teachers.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No teachers yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first teacher to start organizing school contacts
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <Card key={teacher.id} className="p-5 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{teacher.name}</h3>
                      {teacher.subject && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 mt-1">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {teacher.subject}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            name: teacher.name,
                            email: teacher.email || '',
                            phone: teacher.phone || '',
                            subject: teacher.subject || '',
                            school: teacher.school || '',
                            notes: teacher.notes || '',
                          });
                          setEditingId(teacher.id);
                          setShowAddForm(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(teacher.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    {teacher.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <a href={`mailto:${teacher.email}`} className="hover:text-blue-600 truncate">
                          {teacher.email}
                        </a>
                      </div>
                    )}
                    {teacher.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <a href={`tel:${teacher.phone}`} className="hover:text-blue-600">
                          {teacher.phone}
                        </a>
                      </div>
                    )}
                    {teacher.school && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <School className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{teacher.school}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {teacher.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 italic">{teacher.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Help Card */}
        {teachers.length > 0 && (
          <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> Go to a child's profile and click the Teachers tab to associate
              these teachers with your kids.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
