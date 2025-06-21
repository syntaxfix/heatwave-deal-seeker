
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const couponSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  code: z.string().min(1, 'Coupon code is required'),
  shop_id: z.string().min(1, 'Shop is required'),
  discount_percentage: z.coerce.number().optional(),
  discount_amount: z.coerce.number().optional(),
  expires_at: z.string().optional(),
  verified: z.boolean().default(false),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface Shop {
  id: string;
  name: string;
}

interface CouponFormProps {
  coupon?: any;
  onSuccess: () => void;
}

export const CouponForm = ({ coupon, onSuccess }: CouponFormProps) => {
  const queryClient = useQueryClient();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      title: coupon?.title || '',
      description: coupon?.description || '',
      code: coupon?.code || '',
      shop_id: coupon?.shop_id || '',
      discount_percentage: coupon?.discount_percentage || undefined,
      discount_amount: coupon?.discount_amount || undefined,
      expires_at: coupon?.expires_at ? new Date(coupon.expires_at).toISOString().substring(0, 16) : '',
      verified: coupon?.verified || false,
    },
  });
  
  useEffect(() => {
    const fetchShops = async () => {
      const { data, error } = await supabase.from('shops').select('id, name').order('name');
      if (error) {
        toast.error('Failed to fetch shops');
      } else {
        setShops(data || []);
      }
    };
    fetchShops();
  }, []);

  const onSubmit = async (data: CouponFormValues) => {
    setIsLoading(true);
    
    const couponData: any = {
      ...data,
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
      discount_percentage: data.discount_percentage || null,
      discount_amount: data.discount_amount || null,
    };
    
    let error;
    if (coupon) {
      // Update
      const { error: updateError } = await supabase.from('coupons').update(couponData).eq('id', coupon.id);
      error = updateError;
    } else {
      // Create
      const { error: insertError } = await supabase.from('coupons').insert(couponData);
      error = insertError;
    }

    if (error) {
      toast.error(`Failed to ${coupon ? 'update' : 'create'} coupon: ${error.message}`);
    } else {
      toast.success(`Coupon ${coupon ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      onSuccess();
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 20% off everything" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Details about the coupon..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code</FormLabel>
                  <FormControl>
                    <Input placeholder="SAVE20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shop_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a shop" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shops.map((shop) => (
                          <SelectItem key={shop.id} value={shop.id}>
                            {shop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="discount_percentage"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Discount Percentage (%)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="20" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="discount_amount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Discount Amount (£)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="10.00" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="expires_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expires At (Optional)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="verified"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Verified
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Coupon'}
        </Button>
      </form>
    </Form>
  );
};
