
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';

const staticPageFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().min(1, 'Slug is required'),
  is_visible: z.boolean().default(true),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type StaticPageFormValues = z.infer<typeof staticPageFormSchema>;
type StaticPage = Database['public']['Tables']['static_pages']['Row'];

interface StaticPageFormProps {
    initialData?: StaticPage | null;
    onSuccess?: () => void;
}

export const StaticPageForm = ({ initialData, onSuccess }: StaticPageFormProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const form = useForm<StaticPageFormValues>({
    resolver: zodResolver(staticPageFormSchema),
    defaultValues: initialData || {
      title: '',
      content: '',
      slug: '',
      is_visible: true,
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      canonical_url: '',
    },
  });

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        title: '',
        content: '',
        slug: '',
        is_visible: true,
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        canonical_url: '',
      });
    }
  }, [initialData, form]);

  const onSubmit: SubmitHandler<StaticPageFormValues> = async (values) => {
    setLoading(true);
    try {
      if (isEditMode && initialData) {
        const { error } = await supabase
          .from('static_pages')
          .update(values)
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success('Static page updated successfully!');
      } else {
        const { error } = await supabase.from('static_pages').insert({
          title: values.title,
          slug: values.slug,
          content: values.content,
          is_visible: values.is_visible,
          meta_title: values.meta_title,
          meta_description: values.meta_description,
          meta_keywords: values.meta_keywords,
          canonical_url: values.canonical_url,
        });
        if (error) throw error;
        toast.success('Static page created successfully!');
      }
      
      queryClient.invalidateQueries({ queryKey: ['static_pages'] });
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error('Error saving static page:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="Page Title" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl><Input placeholder="/page-slug" {...field} disabled={isEditMode} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl><Textarea placeholder="Page content (Markdown supported)" rows={10} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Visible</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <h3 className="text-lg font-medium pt-4">SEO</h3>
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
          name="meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description</FormLabel>
              <FormControl>
                <Textarea placeholder="SEO Description" {...field} value={field.value ?? ''}/>
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
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isEditMode ? 'Update Static Page' : 'Create Static Page'}
        </Button>
      </form>
    </Form>
  );
};
