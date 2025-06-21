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
import { Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import MDEditor from '@uiw/react-md-editor';

const shopFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  long_description: z.string().optional(),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  category: z.string().optional(),
  logo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  banner_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;
type Shop = Database['public']['Tables']['shops']['Row'];

interface ShopFormProps {
  initialData?: Shop | null;
  onSuccess?: () => void;
}

export const ShopForm = ({ initialData, onSuccess }: ShopFormProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: '',
      description: '',
      long_description: '',
      website_url: '',
      category: '',
      logo_url: '',
      banner_url: '',
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
        long_description: initialData.long_description ?? '',
        website_url: initialData.website_url ?? '',
        category: initialData.category ?? '',
        logo_url: initialData.logo_url ?? '',
        banner_url: initialData.banner_url ?? '',
        meta_title: initialData.meta_title ?? '',
        meta_description: initialData.meta_description ?? '',
        meta_keywords: initialData.meta_keywords ?? '',
        canonical_url: initialData.canonical_url ?? '',
      });
    } else {
      form.reset();
    }
  }, [initialData, form]);

  const onSubmit: SubmitHandler<ShopFormValues> = async (values) => {
    setLoading(true);
    try {
      if (isEditMode && initialData) {
        let slug = initialData.slug;
        if (values.name !== initialData.name) {
          const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
            title: values.name,
            table_name: 'shops',
          });
          if (slugError) throw slugError;
          slug = slugData;
        }

        const { error } = await supabase
          .from('shops')
          .update({ ...values, slug })
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Shop updated successfully!');
      } else {
        const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
          title: values.name,
          table_name: 'shops',
        });
        if (slugError) throw slugError;

        const { error } = await supabase.from('shops').insert({
          ...values,
          name: values.name,
          slug: slugData,
        });

        if (error) throw error;
        toast.success('Shop created successfully!');
      }

      queryClient.invalidateQueries({ queryKey: ['shopsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardCounts'] });
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error('Error saving shop:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[80vh]">
        <ScrollArea className="flex-grow pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Shop Name" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Textarea placeholder="Short description" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="long_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long Description</FormLabel>
                    <FormControl>
                      <div data-color-mode="light">
                        <MDEditor
                          value={field.value ?? ''}
                          onChange={(value) => field.onChange(value)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Electronics" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
                <FormLabel>Or Upload Logo</FormLabel>
                <ImageUpload
                  bucket="images"
                  onUpload={(url) => form.setValue('logo_url', url, { shouldValidate: true })}
                />
            </div>

            <FormField
              control={form.control}
              name="banner_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/banner.png" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
                <FormLabel>Or Upload Banner</FormLabel>
                <ImageUpload
                  bucket="images"
                  onUpload={(url) => form.setValue('banner_url', url, { shouldValidate: true })}
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
          </div>
        </ScrollArea>
        <div className="flex-shrink-0 pt-6 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditMode ? 'Update Shop' : 'Create Shop'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
