import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Download, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { AdminSearch } from './AdminSearch';

type Subscriber = Database['public']['Tables']['subscribers']['Row'];

async function fetchSubscribers() {
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}

async function toggleSubscriberStatus(subscriberId: string, isActive: boolean) {
  const { error } = await supabase
    .from('subscribers')
    .update({ is_active: !isActive })
    .eq('id', subscriberId);
  
  if (error) throw new Error(error.message);
}

async function deleteSubscriber(subscriberId: string) {
  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('id', subscriberId);
  
  if (error) throw new Error(error.message);
}

export const SubscribersAdmin = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);

  const { data: subscribers, isLoading, error } = useQuery({
    queryKey: ['subscribersAdmin'],
    queryFn: fetchSubscribers,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleSubscriberStatus(id, isActive),
    onSuccess: () => {
      toast.success('Subscriber status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['subscribersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardCounts'] });
    },
    onError: (error) => {
      toast.error(`Error updating subscriber: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscriber,
    onSuccess: () => {
      toast.success('Subscriber deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['subscribersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardCounts'] });
    },
    onError: (error) => {
      toast.error(`Error deleting subscriber: ${error.message}`);
    },
  });

  const handleDeleteConfirmation = (subscriber: Subscriber) => {
    setSubscriberToDelete(subscriber);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (subscriberToDelete) {
      deleteMutation.mutate(subscriberToDelete.id);
      setIsAlertOpen(false);
      setSubscriberToDelete(null);
    }
  };

  const exportSubscribers = () => {
    if (!subscribers) return;
    
    const activeSubscribers = subscribers.filter(sub => sub.is_active);
    const csvContent = [
      ['Email', 'Name', 'Subscribed At', 'Source'].join(','),
      ...activeSubscribers.map(sub => [
        sub.email,
        sub.name || '',
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.source || 'unknown'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const filteredSubscribers = subscribers?.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subscriber.name && subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const activeCount = subscribers?.filter(sub => sub.is_active).length || 0;

  if (isLoading) return <div>Loading subscribers...</div>;
  if (error) return <div>Error loading subscribers: {error.message}</div>;

  return (
    <>
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <CardTitle>Subscribers ({activeCount} active)</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <AdminSearch
              placeholder="Search subscribers..."
              onSearch={handleSearch}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-64"
            />
            <Button onClick={exportSubscribers} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber: Subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                      {subscriber.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{subscriber.source || 'unknown'}</TableCell>
                  <TableCell>{new Date(subscriber.subscribed_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => toggleStatusMutation.mutate({
                            id: subscriber.id,
                            isActive: subscriber.is_active
                          })}
                        >
                          {subscriber.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteConfirmation(subscriber)}
                          className="text-red-600 focus:text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subscriber "{subscriberToDelete?.email}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
