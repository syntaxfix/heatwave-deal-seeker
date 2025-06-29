import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Store, ExternalLink } from 'lucide-react';
import { Link } from './Link';
import { SEOHead } from '@/components/SEOHead';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface ShopWithCounts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  category: string | null;
  deal_count: number;
  coupon_count: number;
}

const Shops = () => {
  const [shops, setShops] = useState<ShopWithCounts[]>([]);
  const [filteredShops, setFilteredShops] = useState<ShopWithCounts[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shops" }
  ];

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.category && shop.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredShops(filtered);
    } else {
      setFilteredShops(shops);
    }
  }, [searchTerm, shops]);

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase.rpc('get_shops_with_counts');
      if (error) throw error;
      setShops(data || []);
      setFilteredShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="All Shops - Spark.deals | Browse Popular Stores"
        description="Browse all shops and stores on Spark.deals. Find deals from your favorite retailers and discover new brands with exclusive discounts."
        keywords="shops, stores, retailers, brands, deals, discounts"
        canonical={`${typeof window !== 'undefined' ? window.location.origin : ''}/shops`}
        ogTitle="All Shops - Spark.deals"
        ogDescription="Browse all shops and stores on Spark.deals"
        ogUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/shops`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "All Shops",
          "description": "Collection of shops and stores offering deals",
          "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/shops`
        }}
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">All Shops</h1>
            </div>
            <p className="text-gray-600 mb-6">
              Browse deals from your favorite stores and discover new brands
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Shop Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No shops found' : 'No shops available'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new shops'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map((shop) => (
                <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      {shop.logo_url ? (
                        <img
                          src={shop.logo_url}
                          alt={`${shop.name} logo`}
                          className="w-16 h-16 object-contain rounded-lg bg-white border"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Store className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{shop.name}</CardTitle>
                        {shop.category && (
                          <Badge variant="secondary" className="mt-1">
                            {shop.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {shop.description && (
                      <CardDescription className="line-clamp-2">
                        {shop.description}
                      </CardDescription>
                    )}
                    
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{shop.deal_count} deals</span>
                      <span>{shop.coupon_count} coupons</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button asChild className="limited-time-gradient flex-1">
                        <Link href={`/shop/${shop.slug}`}>
                          View Deals
                        </Link>
                      </Button>
                      {shop.website_url && (
                        <Button variant="outline" size="icon" asChild>
                          <a
                            href={shop.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Visit website"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shops;
