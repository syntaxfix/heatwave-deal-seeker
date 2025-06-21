
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
import { useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;
type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryFormProps {
  initialData?: Category | null;
  onSuccess?: () => void;
}

export const CategoryForm = ({ initialData, onSuccess }: CategoryFormProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialData || { name: '', description: '', icon: '', meta_title: '', meta_description: '', meta_keywords: '', canonical_url: '' },
  });

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({ name: '', description: '', icon: '', meta_title: '', meta_description: '', meta_keywords: '', canonical_url: '' });
    }
  }, [initialData, form]);

  const onSubmit: SubmitHandler<CategoryFormValues> = async (values) => {
    setLoading(true);
    try {
      if (isEditMode && initialData) {
        const { error } = await supabase
          .from('categories')
          .update(values)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Category updated successfully!');
      } else {
        const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
          title: values.name,
          table_name: 'categories',
        });
        if (slugError) throw slugError;

        const { error } = await supabase.from('categories').insert({
          name: values.name,
          slug: slugData,
          description: values.description,
          icon: values.icon,
          meta_title: values.meta_title,
          meta_description: values.meta_description,
          meta_keywords: values.meta_keywords,
          canonical_url: values.canonical_url,
        });
        if (error) throw error;
        toast.success('Category created successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Category Name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (e.g., from lucide-react)</FormLabel>
                  <FormControl><Input placeholder="cpu" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Category description" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
            {isEditMode ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

