
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { ShopForm } from './ShopForm';
import { toast } from 'sonner';

type Shop = Database['public']['Tables']['shops']['Row'];

async function fetchShops() {
  const { data, error } = await supabase.from('shops').select('*').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

async function deleteShop(shopId: string) {
  const { error } = await supabase.from('shops').delete().eq('id', shopId);
  if (error) throw new Error(error.message);
}

export const ShopsAdmin = () => {
  const queryClient = useQueryClient();
  const { data: shops, isLoading, error } = useQuery({ queryKey: ['shopsAdmin'], queryFn: fetchShops });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteShop,
    onSuccess: () => {
      toast.success('Shop deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['shopsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardCounts'] });
    },
    onError: (error) => {
      toast.error(`Error deleting shop: ${error.message}`);
    },
  });

  const handleEdit = (shop: Shop) => {
    setSelectedShop(shop);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedShop(null);
    setIsFormOpen(true);
  };
  
  const handleDeleteConfirmation = (shop: Shop) => {
    setShopToDelete(shop);
    setIsAlertOpen(true);
  };
  
  const handleDelete = () => {
    if (shopToDelete) {
      deleteMutation.mutate(shopToDelete.id);
      setIsAlertOpen(false);
      setShopToDelete(null);
    }
  };

  if (isLoading) return <div>Loading shops...</div>;
  if (error) return <div>Error loading shops: {error.message}</div>;

  return (
    <>
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Shops</CardTitle>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Shop
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops?.map((shop: Shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell>
                    {shop.website_url ? (
                      <a href={shop.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {shop.website_url}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{shop.category}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(shop)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteConfirmation(shop)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedShop ? 'Edit Shop' : 'Add New Shop'}</DialogTitle>
          </DialogHeader>
          <ShopForm 
            initialData={selectedShop} 
            onSuccess={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shop "{shopToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
