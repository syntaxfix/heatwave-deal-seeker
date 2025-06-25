import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Check, X } from 'lucide-react';
import Header from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SEOHead } from '@/components/SEOHead';

interface Deal {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  status: string;
  created_at: string;
  profiles: { username: string; full_name: string } | null;
}

export default function Admin() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [pendingDeals, setPendingDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Admin Dashboard" }
  ];

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile || !['admin', 'moderator', 'root_admin'].includes(profile.role)) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }

    setUserProfile(profile);
    fetchPendingDeals();
  };

  const fetchPendingDeals = async () => {
    const { data: dealsData, error: dealsError } = await supabase
      .from('deals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (dealsError) {
      console.error('Error fetching pending deals:', dealsError);
      return;
    }

    if (!dealsData || dealsData.length === 0) {
      setPendingDeals([]);
      return;
    }

    const userIds = [...new Set(dealsData.map(deal => deal.user_id).filter(Boolean))];

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }

    const dealsWithProfiles = dealsData.map(deal => ({
      ...deal,
      profiles: deal.user_id ? profilesMap.get(deal.user_id) || null : null
    }));

    setPendingDeals(dealsWithProfiles);
  };

  const handleDealAction = async (dealId: string, action: 'approved' | 'rejected') => {
    setIsLoading(true);

    const { error } = await supabase
      .from('deals')
      .update({ status: action })
      .eq('id', dealId);

    if (error) {
      toast.error(`Failed to ${action} deal: ` + error.message);
    } else {
      toast.success(`Deal ${action} successfully!`);
      fetchPendingDeals();
    }

    setIsLoading(false);
  };

  if (!userProfile || !['admin', 'moderator', 'root_admin'].includes(userProfile.role)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-gray-600">You need admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/login">
      <div className="min-h-screen bg-gray-50">
        <SEOHead 
          title="Admin Dashboard - Spark.deals"
          description="Admin dashboard for managing deals, users, and site content."
        />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-gray-600">Manage deals, users, and site content</p>
          </div>

          <Tabs defaultValue="deals" className="space-y-6">
            <TabsList>
              <TabsTrigger value="deals">Pending Deals ({pendingDeals.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="deals">
              <div className="space-y-4">
                {pendingDeals.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-gray-600">No pending deals to review.</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingDeals.map((deal) => (
                    <Card key={deal.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{deal.title}</CardTitle>
                            <CardDescription>
                              Posted by @{deal.profiles?.username || 'Unknown'} on{' '}
                              {new Date(deal.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{deal.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="line-through text-gray-400">
                              ${deal.original_price}
                            </span>
                            <span className="ml-2 font-semibold text-green-600">
                              ${deal.discounted_price}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleDealAction(deal.id, 'approved')}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDealAction(deal.id, 'rejected')}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
