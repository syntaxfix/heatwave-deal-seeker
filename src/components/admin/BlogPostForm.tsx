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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const blogPostFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  summary: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  featured_image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['published', 'draft']).default('published'),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;
type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

interface BlogPostFormProps {
  initialData?: BlogPost | null;
  onSuccess?: () => void;
}

export const BlogPostForm = ({ initialData, onSuccess }: BlogPostFormProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: '',
      content: '',
      summary: '',
      category: '',
      tags: '',
      featured_image: '',
      status: 'published',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      canonical_url: '',
    },
  });
  
  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        ...initialData,
        content: initialData.content ?? '',
        summary: initialData.summary ?? '',
        category: initialData.category ?? '',
        tags: initialData.tags?.join(', ') ?? '',
        featured_image: initialData.featured_image ?? '',
        status: initialData.status === 'published' ? 'published' : 'draft',
        meta_title: initialData.meta_title ?? '',
        meta_description: initialData.meta_description ?? '',
        meta_keywords: initialData.meta_keywords ?? '',
        canonical_url: initialData.canonical_url ?? '',
      });
    } else {
      form.reset();
    }
  }, [initialData, form, isEditMode]);

  const onSubmit: SubmitHandler<BlogPostFormValues> = async (values) => {
    setLoading(true);
    try {
      const tagsArray = values.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [];
      
      if (isEditMode && initialData) {
        let slug = initialData.slug;
        if (values.title !== initialData.title) {
          const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
            title: values.title,
            table_name: 'blog_posts',
          });
          if (slugError) throw slugError;
          slug = slugData;
        }

        const updatePayload = {
          ...values,
          tags: tagsArray,
          slug,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('blog_posts')
          .update(updatePayload)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Blog post updated successfully!');
      } else {
        const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
          title: values.title,
          table_name: 'blog_posts',
        });
        if (slugError) throw slugError;

        const insertPayload = {
          ...values,
          title: values.title,
          tags: tagsArray,
          slug: slugData,
        };
        const { error } = await supabase.from('blog_posts').insert(insertPayload);
        if (error) throw error;
        toast.success('Blog post created successfully!');
      }

      queryClient.invalidateQueries({ queryKey: ['blogPostsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardCounts'] });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error saving blog post:', error);
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
                <FormControl>
                  <Input placeholder="Blog Post Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea placeholder="Blog post content (Markdown supported)" rows={10} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Textarea placeholder="Short summary of the post" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tech" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="tech, news, updates" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="md:col-span-2">
            <FormField
            control={form.control}
            name="featured_image"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Featured Image URL</FormLabel>
                <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="md:col-span-2 space-y-2">
            <FormLabel>Or Upload Featured Image</FormLabel>
            <ImageUpload
              bucket="images"
              onUpload={(url) => form.setValue('featured_image', url, { shouldValidate: true })}
            />
        </div>
        
        <div className="md:col-span-2">
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                    </Select>
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
        <div className="md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditMode ? 'Update Blog Post' : 'Create Blog Post'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
