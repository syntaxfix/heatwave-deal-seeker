import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

const dealFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  affiliate_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  original_price: z.coerce.number().positive('Must be positive').optional(),
  discounted_price: z.coerce.number().positive('Must be positive'),
  category_id: z.string().uuid('Must be a valid category'),
  shop_id: z.string().uuid('Must be a valid shop'),
  expires_at: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type DealFormValues = z.infer<typeof dealFormSchema>;
type DropdownItem = { id: string; name: string };
type Deal = Database['public']['Tables']['deals']['Row'];

interface DealFormProps {
  initialData?: Deal | null;
  onSuccess?: () => void;
}

export const DealForm = ({ initialData, onSuccess }: DealFormProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<DropdownItem[]>([]);
  const [shops, setShops] = useState<DropdownItem[]>([]);

  const isEditMode = !!initialData;

  useEffect(() => {
    const fetchDropdownData = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('id, name');
      if (categoriesError) toast.error('Failed to fetch categories');
      else setCategories(categoriesData || []);

      const { data: shopsData, error: shopsError } = await supabase.from('shops').select('id, name');
      if (shopsError) toast.error('Failed to fetch shops');
      else setShops(shopsData || []);
    };
    fetchDropdownData();
  }, []);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: '',
      description: '',
      image_url: '',
      affiliate_link: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      canonical_url: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        description: initialData.description ?? '',
        image_url: initialData.image_url ?? '',
        affiliate_link: initialData.affiliate_link ?? '',
        original_price: initialData.original_price ?? undefined,
        expires_at: initialData.expires_at ? new Date(initialData.expires_at).toISOString().substring(0, 16) : '',
        meta_title: initialData.meta_title ?? '',
        meta_description: initialData.meta_description ?? '',
        meta_keywords: initialData.meta_keywords ?? '',
        canonical_url: initialData.canonical_url ?? '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        image_url: '',
        affiliate_link: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        canonical_url: '',
      });
    }
  }, [initialData, form]);

  const onSubmit: SubmitHandler<DealFormValues> = async (values) => {
    setLoading(true);
    try {
      if (isEditMode && initialData) {
        let slug = initialData.slug;
        if (values.title && values.title !== initialData.title) {
          const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
            title: values.title,
            table_name: 'deals',
          });
          if (slugError) throw slugError;
          slug = slugData;
        }

        const updatePayload = {
          ...values,
          slug,
          updated_at: new Date().toISOString(),
          expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : null,
        };

        const { error } = await supabase
          .from('deals')
          .update(updatePayload)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Deal updated successfully!');
      } else {
        const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
          title: values.title,
          table_name: 'deals',
        });
        if (slugError) throw slugError;

        const insertPayload: Database['public']['Tables']['deals']['Insert'] = {
          ...values,
          title: values.title,
          slug: slugData,
          user_id: user?.id ?? null,
          expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : null,
        };

        const { error } = await supabase.from('deals').insert(insertPayload);

        if (error) throw error;
        toast.success('Deal created successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardCounts'] });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error saving deal:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="Deal Title" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Deal description" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a shop" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shops.map((shop) => <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="original_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original Price</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="99.99" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discounted_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discounted Price</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="49.99" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="affiliate_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Affiliate Link</FormLabel>
              <FormControl><Input placeholder="https://a.co/deal" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expires_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expires At</FormLabel>
              <FormControl><Input type="datetime-local" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl><Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="md:col-span-2 space-y-2">
            <FormLabel>Or Upload Image</FormLabel>
            <ImageUpload
              bucket="images"
              onUpload={(url) => form.setValue('image_url', url, { shouldValidate: true })}
            />
        </div>
        
        <h3 className="text-lg font-medium pt-4 md:col-span-2">SEO</h3>
        <FormField
          control={form.control}
          name="meta_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title</FormLabel>
              <FormControl>
                <Input placeholder="SEO Title" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="meta_keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Keywords</FormLabel>
              <FormControl>
                <Input placeholder="keyword1, keyword2" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="meta_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="SEO Description" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="canonical_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Canonical URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/canonical-url" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditMode ? 'Update Deal' : 'Create Deal'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
