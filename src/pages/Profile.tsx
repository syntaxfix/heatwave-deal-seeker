
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Package, Filter, Edit2, Save, X, MessageSquare } from 'lucide-react';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';

interface Deal {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  status: string;
  created_at: string;
  image_url: string;
  heat_score: number;
  upvotes: number;
  downvotes: number;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchUserProfile();
    fetchUserDeals();
  }, [user, navigate]);

  useEffect(() => {
    filterDeals();
  }, [deals, statusFilter]);

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setUserProfile(data);
      setEditForm({
        username: data.username || '',
        full_name: data.full_name || '',
      });
    }
  };

  const fetchUserDeals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals:', error);
    } else {
      setDeals(data || []);
    }
  };

  const filterDeals = () => {
    let filtered = deals;
    
    if (statusFilter !== 'all') {
      filtered = deals.filter(deal => deal.status === statusFilter);
    }
    
    setFilteredDeals(filtered);
  };

  const handleUpdateProfile = async () => {
    if (!user || !userProfile) return;

    setIsLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        username: editForm.username,
        full_name: editForm.full_name,
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile: ' + error.message);
    } else {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchUserProfile();
    }
    
    setIsLoading(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusCount = (status: string) => {
    return deals.filter(deal => deal.status === status).length;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>
          <p className="text-gray-600">Manage your account and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Profile Information
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={editForm.username}
                        onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleUpdateProfile} disabled={isLoading} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            username: userProfile?.username || '',
                            full_name: userProfile?.full_name || '',
                          });
                        }}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Username</p>
                      <p className="text-gray-900">@{userProfile?.username || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-gray-900">{userProfile?.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <Badge variant="outline">{userProfile?.role}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Deals</span>
                    <span className="font-medium">{deals.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Approved</span>
                    <span className="font-medium text-green-600">{getStatusCount('approved')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-medium text-yellow-600">{getStatusCount('pending')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rejected</span>
                    <span className="font-medium text-red-600">{getStatusCount('rejected')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Tabs Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Activity</CardTitle>
                <CardDescription>
                  View and manage your submitted content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="deals" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="deals" className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>My Deals ({deals.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Comments (0)</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="deals" className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All ({deals.length})</SelectItem>
                            <SelectItem value="approved">Approved ({getStatusCount('approved')})</SelectItem>
                            <SelectItem value="pending">Pending ({getStatusCount('pending')})</SelectItem>
                            <SelectItem value="rejected">Rejected ({getStatusCount('rejected')})</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {filteredDeals.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {statusFilter === 'all' ? 'No deals submitted yet' : `No ${statusFilter} deals`}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {statusFilter === 'all' 
                            ? 'Start sharing amazing deals with the community!'
                            : `You don't have any ${statusFilter} deals at the moment.`
                          }
                        </p>
                        {statusFilter === 'all' && (
                          <Button onClick={() => navigate('/post-deal')}>
                            Submit Your First Deal
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredDeals.map((deal) => (
                          <Card key={deal.id} className="border">
                            <CardContent className="pt-4">
                              <div className="flex items-start space-x-4">
                                {deal.image_url && (
                                  <img
                                    src={deal.image_url}
                                    alt={deal.title}
                                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-medium text-gray-900 truncate">
                                        {deal.title}
                                      </h3>
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {deal.description}
                                      </p>
                                    </div>
                                    <Badge variant={getStatusBadgeVariant(deal.status)} className="ml-2">
                                      {deal.status}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                      <span>
                                        {formatPrice(deal.original_price)} → {formatPrice(deal.discounted_price)}
                                      </span>
                                      <span>
                                        {deal.upvotes} upvotes
                                      </span>
                                      <span>
                                        Heat: {deal.heat_score}
                                      </span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                      {new Date(deal.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="comments" className="mt-6">
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                      <p className="text-gray-600">
                        Your comments on deals and posts will appear here.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
