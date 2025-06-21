import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import DealListings from '@/components/DealListings';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Package, Clock, Star, ArrowRight, Zap, Gift, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories } from '@/data/categories';
import { SEOHead } from '@/components/SEOHead';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: any;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  featured_image?: string;
  created_at: string;
}

interface Stats {
  totalDeals: number;
  todaysDeals: number;
  activeUsers: number;
  hotDeal?: any;
}

const fetchSettings = async () => {
  const { data, error } = await supabase.from('system_settings').select('key, value');
  if (error) {
    console.error("Error fetching system settings", error);
    return {};
  }
  
  const settings = data.reduce((acc, { key, value }) => {
    if (key) acc[key] = value;
    return acc;
  }, {} as { [key: string]: string | null });

  return settings;
};

const Index = () => {
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDeals: 0,
    todaysDeals: 0,
    activeUsers: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [sortBy, setSortBy] = useState('hot');

  const { data: settings } = useQuery({
    queryKey: ['system_settings'],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    if (settings) {
      if (settings.homepage_meta_title) {
        document.title = settings.homepage_meta_title;
      }
      
      // Update or create meta description
      if (settings.homepage_meta_description) {
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', settings.homepage_meta_description);
      }

      // Update or create meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (settings.homepage_meta_keywords) {
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', settings.homepage_meta_keywords);
      } else if (metaKeywords) {
        // If setting is empty/null but tag exists, remove it.
        metaKeywords.remove();
      }
    }
  }, [settings]);

  useEffect(() => {
    fetchInitialData();
    // Use the imported categories from data file with their icons
    setCategoriesData(categories.slice(0, 8));
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch categories from database but use local categories with icons as fallback
      const { data: categoriesFromDB } = await supabase
        .from('categories')
        .select('*')
        .limit(8);
      
      // If we have categories from DB, merge them with local category data to get icons
      if (categoriesFromDB && categoriesFromDB.length > 0) {
        const mergedCategories = categoriesFromDB.map(dbCategory => {
          const localCategory = categories.find(cat => cat.slug === dbCategory.slug);
          return {
            ...dbCategory,
            icon: localCategory?.icon || null
          };
        });
        setCategoriesData(mergedCategories);
      }

      // Fetch shops
      const { data: shopsData } = await supabase
        .from('shops')
        .select('*')
        .limit(12);
      
      if (shopsData) setShops(shopsData);

      // Fetch recent blog posts
      const { data: blogData } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (blogData) setBlogPosts(blogData);

      // Fetch stats
      const today = new Date().toISOString().split('T')[0];
      
      const [
        { count: totalDeals },
        { count: todaysDeals },
        { data: hotDeal }
      ] = await Promise.all([
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'approved').gte('created_at', today),
        supabase.from('deals').select('*').eq('status', 'approved').order('heat_score', { ascending: false }).limit(1).single()
      ]);

      setStats({
        totalDeals: totalDeals || 0,
        todaysDeals: todaysDeals || 0,
        activeUsers: Math.floor(Math.random() * 100) + 50, // Simulated for now
        hotDeal: hotDeal
      });
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DealSpark",
    "description": "Find amazing deals, voted by our community of savvy shoppers. Save up to 90% on your favorite products.",
    "url": window.location.origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${window.location.origin}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <SEOHead 
        title={settings?.homepage_meta_title || "DealSpark - Find Amazing Deals & Coupons"}
        description={settings?.homepage_meta_description || "Discover hand-picked deals, voted by our community of savvy shoppers. Save up to 90% on your favorite products."}
        keywords={settings?.homepage_meta_keywords || "deals, coupons, discounts, shopping, savings"}
        canonical={window.location.origin}
        ogTitle="DealSpark - Best Deals & Coupons Community"
        ogDescription="Join thousands of deal hunters finding the best discounts and coupons online."
        ogUrl={window.location.href}
        structuredData={structuredData}
      />
      <Header />
      
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center mb-12">
            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Trophy className="h-4 w-4 text-yellow-300" />
              <span className="text-white text-sm font-medium">
                Trusted by {stats.activeUsers}+ deal hunters
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              Find{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Amazing
              </span>{' '}
              Deals
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Discover hand-picked deals, voted by our community of savvy shoppers. 
              <span className="text-yellow-300 font-semibold"> Save up to 90% </span>
              on your favorite products.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="🔍 Search deals, brands, or products..." 
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/deals">
                <Button size="lg" variant="success" className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <Gift className="h-5 w-5 mr-2" />
                  Browse Hot Deals
                </Button>
              </Link>
              <Link to="/post-deal">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold">
                  <Target className="h-5 w-5 mr-2" />
                  Post a Deal
                </Button>
              </Link>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card className="bg-white/15 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.totalDeals}</div>
                <div className="text-sm opacity-80">Active Deals</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/15 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.todaysDeals}</div>
                <div className="text-sm opacity-80">Today's Deals</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/15 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.activeUsers}</div>
                <div className="text-sm opacity-80">Happy Users</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/15 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  {stats.hotDeal?.heat_score || 0}°
                </div>
                <div className="text-sm opacity-80">Hottest Deal</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Main Content */}
          <div className="lg:w-3/4">
            {/* Hot Deals Banner */}
            <div className="limited-time-gradient rounded-2xl p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center">
                    🔥 Limited Time Offers
                  </h2>
                  <p className="text-red-100">Don't miss out on these incredible deals!</p>
                </div>
                <Link to="/deals">
                  <Button variant="limited-time-light" className="bg-white text-red-500 hover:bg-red-50 font-semibold">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Enhanced Categories Section with Better Layout */}
            <section className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  Shop by Category
                </h2>
                <p className="text-gray-600 text-lg">
                  Find deals in your favorite categories
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {categoriesData.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="group"
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-blue-300 border-2 border-transparent bg-gradient-to-br from-white to-blue-50/30 h-full">
                        <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[140px]">
                          <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                            {IconComponent ? (
                              <div className="p-3 bg-blue-100 rounded-2xl group-hover:bg-blue-200 transition-colors">
                                <IconComponent className="h-8 w-8 text-blue-600" />
                              </div>
                            ) : (
                              <div className="h-14 w-14 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <span className="text-blue-600 font-bold text-xl">{category.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-sm">
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Explore deals
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              
              <div className="text-center mt-8">
                <Link to="/categories">
                  <Button size="lg" variant="outline" className="group border-2 hover:border-blue-500 hover:text-blue-600">
                    Explore All Categories
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </section>

            {/* Enhanced Shops Section */}
            <section className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  Top Brands & Stores
                </h2>
                <p className="text-gray-600 text-lg">
                  Shop from your favorite brands
                </p>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {shops.map((shop) => (
                  <Link
                    key={shop.id}
                    to={`/shop/${shop.slug}`}
                    className="group"
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-green-300 border-2 border-transparent">
                      <CardContent className="p-4 text-center">
                        {shop.logo_url ? (
                          <img
                            src={shop.logo_url}
                            alt={shop.name}
                            className="w-16 h-16 mx-auto mb-3 object-contain group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                            <span className="text-xl font-bold text-gray-600">{shop.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="font-semibold text-sm text-gray-800 group-hover:text-green-600 transition-colors truncate">
                          {shop.name}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Link to="/shops">
                  <Button size="lg" variant="outline" className="group border-2 hover:border-green-500 hover:text-green-600">
                    View All Stores
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </section>

            {/* Filter Bar */}
            <FilterBar
              categories={categories}
              shops={shops}
              selectedCategory={selectedCategory}
              selectedShop={selectedShop}
              sortBy={sortBy}
              onCategoryChange={setSelectedCategory}
              onShopChange={setSelectedShop}
              onSortChange={setSortBy}
            />

            {/* Deal Listings */}
            <DealListings
              categorySlug={selectedCategory}
              shopSlug={selectedShop}
              sortBy={sortBy}
              searchQuery={searchQuery}
            />
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-4 space-y-6">
              {/* Enhanced Hot Deal Card */}
              {stats.hotDeal && (
                <Card className="border-2 border-red-200 shadow-lg">
                  <CardHeader className="limited-time-gradient text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-lg">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      🔥 Deal of the Day
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Link to={`/deal/${stats.hotDeal.slug}`} className="block group">
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        {stats.hotDeal.image_url && (
                          <img
                            src={stats.hotDeal.image_url}
                            alt={stats.hotDeal.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                          {stats.hotDeal.title}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-red-500 hover:bg-red-600 text-white">
                            {stats.hotDeal.heat_score}° Hot
                          </Badge>
                          {stats.hotDeal.discount_percentage && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              -{stats.hotDeal.discount_percentage}% OFF
                            </Badge>
                          )}
                        </div>
                        <a
                          href={stats.hotDeal.affiliate_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="limited-time" className="w-full hover:opacity-90">
                            Get This Deal
                          </Button>
                        </a>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Blog Section */}
              {blogPosts.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Star className="h-5 w-5 mr-2 text-blue-500" />
                      Latest Deal Guides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {blogPosts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <div className="flex space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {post.featured_image && (
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {post.title}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {post.summary}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="text-center pt-2">
                      <Link to="/blog">
                        <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300">
                          Read All Guides
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Guidelines Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">
                    💡 Deal Hunter Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-700 space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Check deal expiry dates</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Compare prices across stores</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Read user reviews first</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Vote on deals you like</span>
                  </div>
                  <Button variant="info" className="w-full mt-4" size="sm">
                    Share a Deal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
