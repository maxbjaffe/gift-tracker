'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Trash2, Shield, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  is_admin: boolean;
  signup_date: string;
  last_login: string | null;
  recipient_count: number;
  gift_count: number;
  conversation_count: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    checkAdminAndLoadUsers();
  }, []);

  async function checkAdminAndLoadUsers() {
    try {
      const supabase = createClient();

      // Check if user is authenticated and admin
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        toast.error('Unauthorized: Admin access required');
        router.push('/');
        return;
      }

      setIsAdmin(true);

      // Fetch users
      await loadUsers();
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast.error('Failed to verify admin access');
      router.push('/');
    }
  }

  async function loadUsers() {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load users');
      }

      setUsers(data.users);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      setDeleteUserId(null);
      await loadUsers(); // Reload the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <p className="text-muted-foreground">
          View and manage all registered users
        </p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Signup Date</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Gifts</TableHead>
              <TableHead>Conversations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        User
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.signup_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{user.recipient_count}</TableCell>
                  <TableCell>{user.gift_count}</TableCell>
                  <TableCell>{user.conversation_count}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteUserId(user.id)}
                      disabled={user.is_admin}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Their account</li>
                <li>All their recipients</li>
                <li>All their gifts</li>
                <li>All their chat conversations</li>
              </ul>
              <p className="mt-3 font-semibold text-red-600">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
