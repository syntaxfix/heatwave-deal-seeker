
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/integrations/supabase/types';
import { Pencil, Trash2 } from 'lucide-react';
import { UserForm } from './UserForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Profile = Database['public']['Tables']['profiles']['Row'];

async function fetchUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export const UsersAdmin = () => {
  const queryClient = useQueryClient();
  const { data: users, isLoading, error } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      // Note: This only deletes the profile record, not the auth user.
      // For full user deletion, an edge function calling supabase.auth.admin.deleteUser is needed.
      const { error } = await supabase.from('profiles').delete().eq('id', selectedUser.id);
      if (error) throw error;
      toast.success('User profile deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAlertOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(`Error deleting user: ${error.message}`);
    }
  };
  
  const openFormForEdit = (user: Profile) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const openAlertForDelete = (user: Profile) => {
    setSelectedUser(user);
    setIsAlertOpen(true);
  };

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users: {error.message}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => openFormForEdit(user)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => openAlertForDelete(user)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <UserForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} user={selectedUser} />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the user's profile. It does not delete their authentication record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
