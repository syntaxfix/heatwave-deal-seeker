
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Package, Upload, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
}

const PostDeal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    original_price: '',
    discounted_price: '',
    affiliate_link: '',
    category_id: '',
    shop_id: '',
    expires_at: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOptions();
  }, [user, navigate]);

  const fetchOptions = async () => {
    try {
      const [categoriesRes, shopsRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('shops').select('*').order('name')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (shopsRes.data) setShops(shopsRes.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDiscount = () => {
    const original = parseFloat(formData.original_price);
    const discounted = parseFloat(formData.discounted_price);
    
    if (original && discounted && original > discounted) {
      return Math.round(((original - discounted) / original) * 100);
    }
    return 0;
  };

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to post a deal');
      return;
    }

    setLoading(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        toast.error('Please enter a deal title');
        return;
      }

      if (!formData.affiliate_link.trim()) {
        toast.error('Please enter the deal link');
        return;
      }

      const discountPercentage = calculateDiscount();
      
      // Generate a unique slug using title + timestamp
      const baseSlug = generateSlugFromTitle(formData.title);
      const uniqueSlug = `${baseSlug}-${Date.now()}`;

      const dealData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        discounted_price: formData.discounted_price ? parseFloat(formData.discounted_price) : null,
        discount_percentage: discountPercentage > 0 ? discountPercentage : null,
        affiliate_link: formData.affiliate_link.trim(),
        category_id: formData.category_id || null,
        shop_id: formData.shop_id || null,
        expires_at: formData.expires_at || null,
        user_id: user.id,
        status: 'pending',
        slug: uniqueSlug,
        heat_score: 0,
        upvotes: 0,
        downvotes: 0,
        views: 0
      };

      const { error } = await supabase
        .from('deals')
        .insert(dealData);

      if (error) {
        console.error('Error submitting deal:', error);
        toast.error('Failed to submit deal. Please try again.');
        return;
      }

      toast.success('Deal submitted successfully! It will be reviewed by our team.');
      navigate('/profile');
    } catch (error) {
      console.error('Error submitting deal:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <main>
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                <p className="text-gray-600 mb-4">
                  You need to be logged in to submit a deal.
                </p>
                <Button onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Package className="h-6 w-6 mr-2" />
                  Submit a New Deal
                </CardTitle>
                <CardDescription>
                  Share amazing deals with our community. All submissions are reviewed before going live.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Deal Title */}
                  <div>
                    <Label htmlFor="title">Deal Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., iPhone 15 Pro - 20% Off at Apple Store"
                      maxLength={200}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.title.length}/200 characters
                    </p>
                  </div>

                  {/* Deal Description */}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Provide more details about this deal..."
                      rows={4}
                      maxLength={1000}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.description.length}/1000 characters
                    </p>
                  </div>

                  {/* Deal Image */}
                  <div>
                    <Label htmlFor="image_url">Product Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => handleInputChange('image_url', e.target.value)}
                      placeholder="https://example.com/product-image.jpg"
                    />
                    {formData.image_url && (
                      <div className="mt-2">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="original_price">Original Price (£)</Label>
                      <Input
                        id="original_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.original_price}
                        onChange={(e) => handleInputChange('original_price', e.target.value)}
                        placeholder="99.99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discounted_price">Sale Price (£)</Label>
                      <Input
                        id="discounted_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.discounted_price}
                        onChange={(e) => handleInputChange('discounted_price', e.target.value)}
                        placeholder="79.99"
                      />
                    </div>
                  </div>

                  {/* Discount Preview */}
                  {calculateDiscount() > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 font-semibold">
                        Discount: {calculateDiscount()}% OFF
                      </p>
                      <p className="text-green-600 text-sm">
                        Savings: £{(parseFloat(formData.original_price) - parseFloat(formData.discounted_price)).toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Deal Link */}
                  <div>
                    <Label htmlFor="affiliate_link">Deal Link *</Label>
                    <Input
                      id="affiliate_link"
                      type="url"
                      value={formData.affiliate_link}
                      onChange={(e) => handleInputChange('affiliate_link', e.target.value)}
                      placeholder="https://store.example.com/product-deal"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      The direct link where users can get this deal
                    </p>
                  </div>

                  {/* Category and Shop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Shop</Label>
                      <Select value={formData.shop_id} onValueChange={(value) => handleInputChange('shop_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shop" />
                        </SelectTrigger>
                        <SelectContent>
                          {shops.map((shop) => (
                            <SelectItem key={shop.id} value={shop.id}>
                              {shop.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <Label htmlFor="expires_at">Deal Expires (Optional)</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => handleInputChange('expires_at', e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  {/* Submission Guidelines */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Submission Guidelines</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Make sure the deal is currently active and available</li>
                      <li>• Use clear, descriptive titles without excessive capitalization</li>
                      <li>• Include accurate pricing information</li>
                      <li>• Only submit genuine deals, not regular prices</li>
                      <li>• Respect our community guidelines and terms of service</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" disabled={loading} className="w-full" size="lg">
                    {loading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Submitting Deal...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Deal for Review
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default PostDeal;
