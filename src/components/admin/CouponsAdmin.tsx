import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CouponForm } from './CouponForm';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from './TableSkeleton';
import { AdminSearch } from './AdminSearch';
import { AdminPagination } from './AdminPagination';

const fetchCoupons = async (searchQuery: string, page: number, itemsPerPage: number) => {
  let query = supabase
    .from('coupons')
    .select(`
      *,
      shops (name)
    `, { count: 'exact' });

  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }

  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }
  return { data: data || [], count: count || 0 };
};

export const CouponsAdmin = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { data: result, isLoading } = useQuery({
    queryKey: ['coupons', searchQuery, currentPage, itemsPerPage],
    queryFn: () => fetchCoupons(searchQuery, currentPage, itemsPerPage)
  });

  const coupons = result?.data || [];
  const totalItems = result?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleDelete = async (couponId: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    const { error } = await supabase.from('coupons').delete().eq('id', couponId);

    if (error) {
      toast.error('Failed to delete coupon: ' + error.message);
    } else {
      toast.success('Coupon deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    }
  };

  const handleEdit = (coupon: any) => {
    setSelectedCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedCoupon(null);
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCoupon(null);
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Coupons</h2>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      <div className="mb-4">
        <AdminSearch
          placeholder="Search coupons..."
          onSearch={handleSearch}
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full sm:w-80"
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedCoupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
          </DialogHeader>
          <CouponForm coupon={selectedCoupon} onSuccess={closeDialog} />
        </DialogContent>
      </Dialog>
      
      {isLoading ? (
          <TableSkeleton rows={5} columns={7} />
      ) : (
        <>
            <div className="border rounded-lg">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {coupons?.map((coupon: any) => (
                    <TableRow key={coupon.id}>
                        <TableCell className="font-medium">{coupon.title}</TableCell>
                        <TableCell>
                        <Badge variant="outline">{coupon.code}</Badge>
                        </TableCell>
                        <TableCell>{coupon.shops?.name || 'N/A'}</TableCell>
                        <TableCell>
                        {coupon.discount_percentage ? `${coupon.discount_percentage}%` : ''}
                        {coupon.discount_amount ? `£${coupon.discount_amount}` : ''}
                        </TableCell>
                        <TableCell>
                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                        {coupon.verified ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>}
                        </TableCell>
                        <TableCell>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(coupon)}>
                            <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(coupon.id)}>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>

            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />

            {coupons?.length === 0 && (
                <div className="text-center py-10">
                <p>No coupons found.</p>
                </div>
            )}
        </>
      )}
    </div>
  );
};
