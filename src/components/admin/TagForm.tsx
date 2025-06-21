
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';

const tagFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type TagFormValues = z.infer<typeof tagFormSchema>;
type Tag = Database['public']['Tables']['tags']['Row'];

interface TagFormProps {
  initialData?: Tag | null;
  onSuccess?: () => void;
}

export const TagForm = ({ initialData, onSuccess }: TagFormProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: initialData || { name: '' },
  });

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({ name: '' });
    }
  }, [initialData, form]);

  const onSubmit: SubmitHandler<TagFormValues> = async (values) => {
    setLoading(true);
    try {
      if (isEditMode && initialData) {
        const { error } = await supabase
          .from('tags')
          .update({ name: values.name })
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success('Tag updated successfully!');
      } else {
        const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_slug', {
          title: values.name,
          table_name: 'tags',
        });
        if (slugError) throw slugError;

        const { error } = await supabase.from('tags').insert({ name: values.name, slug: slugData });
        if (error) throw error;
        toast.success('Tag created successfully!');
      }
      
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error saving tag:', error);
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input placeholder="Tag Name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isEditMode ? 'Update Tag' : 'Create Tag'}
        </Button>
      </form>
    </Form>
  );
};
