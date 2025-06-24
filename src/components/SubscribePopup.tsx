
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Mail, Gift } from 'lucide-react';

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

type SubscribeFormValues = z.infer<typeof subscribeSchema>;

export const SubscribePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  useEffect(() => {
    const checkAndShowPopup = () => {
      const lastShown = localStorage.getItem('subscriberPopupLastShown');
      const visitStartTime = localStorage.getItem('visitStartTime');
      
      if (!visitStartTime) {
        localStorage.setItem('visitStartTime', Date.now().toString());
      }
      
      if (!lastShown) {
        // Show popup after 10 seconds on first visit
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 10000);
        
        return () => clearTimeout(timer);
      } else {
        const lastShownTime = parseInt(lastShown);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        // If more than 1 hour has passed since last shown, show again
        if (now - lastShownTime > oneHour) {
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 10000);
          
          return () => clearTimeout(timer);
        }
      }
    };

    checkAndShowPopup();
  }, []);

  const onSubmit = async (values: SubscribeFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('subscribers')
        .insert({
          email: values.email,
          name: values.name || null,
          source: 'popup',
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('This email is already subscribed!');
        } else {
          throw error;
        }
      } else {
        toast.success('Thank you for subscribing! 🎉');
        setIsOpen(false);
        localStorage.setItem('subscriberPopupLastShown', Date.now().toString());
      }
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('subscriberPopupLastShown', Date.now().toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Never Miss a Deal!</DialogTitle>
          <DialogDescription className="text-base">
            Subscribe to get the best deals delivered to your inbox. Be the first to know about exclusive offers and discounts!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="your@email.com" 
                        {...field} 
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Subscribing...' : 'Subscribe Now'}
            </Button>
          </form>
        </Form>

        <p className="text-xs text-center text-muted-foreground">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </DialogContent>
    </Dialog>
  );
};
