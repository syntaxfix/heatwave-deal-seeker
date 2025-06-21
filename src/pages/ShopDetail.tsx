
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';
import Header from '@/components/Header';
import DealListings from '@/components/DealListings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Store, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import MDEditor from '@uiw/react-md-editor';
import { SEOHead } from '@/components/SEOHead';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website_url: string;
  category: string;
  long_description?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  summary?: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  heat_score: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  affiliate_link: string;
  slug?: string;
  categories: { name: string; slug: string };
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  discount_percentage: number;
  discount_amount: number;
  expires_at: string;
  verified: boolean;
}

interface OtherShop {
  id: string;
  name:string;
  slug: string;
  logo_url: string;
}

interface PageCategory {
  id: string;
  name: string;
  slug: string;
}

const ShopDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { formatPrice } = useCurrency();
  const [shop, setShop] = useState<Shop | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [otherShops, setOtherShops] = useState<OtherShop[]>([]);
  const [allCategories, setAllCategories] = useState<PageCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchShopData();
    }
  }, [slug]);

  useEffect(() => {
    if (shop) {
      // Set meta tags
      document.title = shop.meta_title || `${shop.name} Deals & Coupons - DealSpark`;
      
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (metaDescriptionTag) {
          metaDescriptionTag.setAttribute('content', shop.meta_description || shop.description || `Find the latest deals and coupons from ${shop.name} on DealSpark.`);
      }

      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
          canonicalLink = document.createElement('link');
          canonicalLink.setAttribute('rel', 'canonical');
          document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', shop.canonical_url || window.location.href);
      fetchOtherData();
    }
  }, [shop]);

  const fetchShopData = async () => {
    if (!slug) return;

    // Fetch shop details
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (shopError) {
      console.error('Error fetching shop:', shopError);
      setLoading(false);
      return;
    }

    setShop(shopData);

    // Fetch coupons for this shop
    const { data: couponsData, error: couponsError } = await supabase
      .from('coupons')
      .select('*')
      .eq('shop_id', shopData.id)
      .order('created_at', { ascending: false });

    if (!couponsError) {
      setCoupons(couponsData || []);
    }

    setLoading(false);
  };

  const fetchOtherData = async () => {
    if (!shop || !shop.category) return;

    // Fetch other shops in the same category
    const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('id, name, slug, logo_url')
        .eq('category', shop.category)
        .neq('id', shop.id)
        .limit(4);

    if (shopsError) {
        console.error('Error fetching other shops:', shopsError);
    } else {
        setOtherShops(shopsData || []);
    }

    // Fetch all categories
    const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
    
    if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
    } else {
        setAllCategories(categoriesData || []);
    }
  };

  const handleCopyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Coupon code copied!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy coupon code');
    }
  };

  const breadcrumbItems = shop ? [
    { label: "Home", href: "/" },
    { label: "Shops", href: "/shops" },
    { label: shop.name }
  ] : [];

  const structuredData = shop ? {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": shop.name,
    "description": shop.description,
    "url": shop.website_url,
    "image": shop.logo_url,
    "category": shop.category
  } : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="flex items-center space-x-4 mb-8">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEOHead 
          title="Shop not found - DealSpark"
          description="The shop you're looking for doesn't exist or has been removed."
        />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Shop not found
            </h1>
            <p className="text-gray-600 mb-6">
              The shop you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/shops">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shops
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasNoCoupons = coupons.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={shop.meta_title || `${shop.name} Deals & Coupons - DealSpark`}
        description={shop.meta_description || shop.description || `Find the latest deals and coupons from ${shop.name} on DealSpark.`}
        canonical={shop.canonical_url || window.location.href}
        ogTitle={`${shop.name} - Best Deals & Coupons`}
        ogDescription={shop.description || `Discover amazing deals from ${shop.name}`}
        ogImage={shop.logo_url}
        ogUrl={window.location.href}
        structuredData={structuredData}
      />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/shops">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shops
            </Link>
          </Button>

          {/* Shop Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={shop.logo_url} alt={shop.name} />
                  <AvatarFallback>
                    <Store className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
                    {shop.category && (
                      <Badge variant="secondary">{shop.category}</Badge>
                    )}
                  </div>
                  {shop.description && (
                    <p className="text-gray-600 mb-4">{shop.description}</p>
                  )}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {coupons.length} coupons
                    </span>
                    {shop.website_url && (
                      <a
                        href={shop.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-sm text-primary hover:underline"
                      >
                        <span>Visit Store</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="deals" className="space-y-6">
            <TabsList>
              <TabsTrigger value="deals">Deals</TabsTrigger>
              <TabsTrigger value="coupons">Coupons ({coupons.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="deals">
              <DealListings
                shopSlug={slug}
                sortBy="newest"
              />
            </TabsContent>

            <TabsContent value="coupons">
              {coupons.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No coupons available
                    </h3>
                    <p className="text-gray-600">
                      Check back soon for new coupons from {shop.name}!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {coupons.map((coupon) => (
                    <Card key={coupon.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{coupon.title}</CardTitle>
                          {coupon.verified && (
                            <Badge variant="secondary">Verified</Badge>
                          )}
                        </div>
                        {coupon.description && (
                          <CardDescription>{coupon.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Code:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {coupon.code}
                            </code>
                          </div>
                          <Button
                            size="sm"
                            variant="limited-time"
                            onClick={() => handleCopyCoupon(coupon.code)}
                            className="flex items-center space-x-1"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span>{copiedCode === coupon.code ? 'Copied' : 'Copy'}</span>
                          </Button>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {coupon.discount_percentage && (
                            <p>Save {coupon.discount_percentage}%</p>
                          )}
                          {coupon.discount_amount && (
                            <p>Save {formatPrice(coupon.discount_amount)}</p>
                          )}
                          {coupon.expires_at && (
                            <p>Expires: {new Date(coupon.expires_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className={`mt-8 ${hasNoCoupons ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-4'} gap-8`}>
            <div className={hasNoCoupons ? 'col-span-1' : 'lg:col-span-3'}>
              {shop.long_description && (
                <Card>
                  <CardHeader>
                    <CardTitle>About {shop.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div data-color-mode="light">
                      <MDEditor.Markdown source={shop.long_description} style={{ background: 'transparent' }} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {!hasNoCoupons && (
              <div className="lg:col-span-1 space-y-8">
                {otherShops.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">More in {shop.category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {otherShops.map(otherShop => (
                                    <Link key={otherShop.id} to={`/shop/${otherShop.slug}`} className="flex items-center space-x-3 group">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={otherShop.logo_url} alt={otherShop.name} />
                                            <AvatarFallback>{otherShop.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium group-hover:text-primary">{otherShop.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {allCategories.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">All Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {allCategories.map(category => (
                                    <Button key={category.id} variant="outline" size="sm" asChild>
                                        <Link to={`/category/${category.slug}`}>
                                            {category.name}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
              </div>
            )}
          </div>

          {/* When no coupons, show related content in horizontal layout */}
          {hasNoCoupons && (otherShops.length > 0 || allCategories.length > 0) && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {otherShops.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">More in {shop.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {otherShops.map(otherShop => (
                        <Link key={otherShop.id} to={`/shop/${otherShop.slug}`} className="flex items-center space-x-3 group">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={otherShop.logo_url} alt={otherShop.name} />
                            <AvatarFallback>{otherShop.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium group-hover:text-primary">{otherShop.name}</span>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {allCategories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">All Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {allCategories.map(category => (
                        <Button key={category.id} variant="outline" size="sm" asChild>
                          <Link to={`/category/${category.slug}`}>
                            {category.name}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;
