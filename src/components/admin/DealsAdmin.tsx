import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DealForm } from './DealForm';
import { Database } from '@/integrations/supabase/types';
import { Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type Deal = Database['public']['Tables']['deals']['Row'];
type DealStatus = 'all' | 'pending' | 'approved' | 'rejected';

async function fetchDeals(status: DealStatus) {
  let query = supabase.from('deals').select('*').order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export const DealsAdmin = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<DealStatus>('all');
  const { data: deals, isLoading, error } = useQuery({
    queryKey: ['deals', statusFilter],
    queryFn: () => fetchDeals(statusFilter),
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [actioningDealId, setActioningDealId] = useState<string | null>(null);

  const handleDealAction = async (dealId: string, action: 'approved' | 'rejected') => {
    setActioningDealId(dealId);
    const { error } = await supabase
      .from('deals')
      .update({ status: action })
      .eq('id', dealId);

    if (error) {
      toast.error(`Failed to ${action} deal: ` + error.message);
    } else {
      toast.success(`Deal ${action} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    }
    setActioningDealId(null);
  };

  const handleDelete = async () => {
    if (!selectedDeal) return;
    try {
      const { error } = await supabase.from('deals').delete().eq('id', selectedDeal.id);
      if (error) throw error;
      toast.success('Deal deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setIsAlertOpen(false);
      setSelectedDeal(null);
    } catch (error: any) {
      toast.error(`Error deleting deal: ${error.message}`);
    }
  };

  const openFormForEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsFormOpen(true);
  };

  const openFormForCreate = () => {
    setSelectedDeal(null);
    setIsFormOpen(true);
  };
  
  const openAlertForDelete = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsAlertOpen(true);
  };

  if (isLoading) return <div>Loading deals...</div>;
  if (error) return <div>Error loading deals: {error.message}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Deals</CardTitle>
        <Button onClick={openFormForCreate}>Create Deal</Button>
      </CardHeader>
      <CardContent>
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as DealStatus)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals?.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">{deal.title}</TableCell>
                <TableCell>
                  <Badge variant={
                    deal.status === 'approved' ? 'default' :
                    deal.status === 'rejected' ? 'destructive' :
                    'secondary'
                  }>
                    {deal.status}
                  </Badge>
                </TableCell>
                <TableCell>${deal.discounted_price}</TableCell>
                <TableCell className="flex gap-2 justify-end">
                  {deal.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleDealAction(deal.id, 'approved')} disabled={!!actioningDealId} className="bg-green-600 hover:bg-green-700">
                        {actioningDealId === deal.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDealAction(deal.id, 'rejected')} disabled={!!actioningDealId}>
                        {actioningDealId === deal.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <X className="h-4 w-4 mr-1" />}
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="icon" onClick={() => openFormForEdit(deal)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => openAlertForDelete(deal)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedDeal ? 'Edit Deal' : 'Create Deal'}</DialogTitle></DialogHeader>
          <DealForm initialData={selectedDeal} onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deal.
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
