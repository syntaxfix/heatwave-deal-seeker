import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DealCard from './DealCard';
import DealCardFull from './DealCardFull';
import DealCardCompact from './DealCardCompact';
import ViewSwitcher, { ViewType } from './ViewSwitcher';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';

interface Deal {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  original_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  slug?: string;
  created_at: string;
  upvotes?: number;
  downvotes?: number;
  heat_score?: number;
  affiliate_link?: string;
  categories?: { name: string; slug: string };
  shops?: { name: string; slug: string; logo_url?: string };
}

interface DealListingsProps {
  categorySlug?: string;
  shopSlug?: string;
  sortBy?: string;
  searchQuery?: string;
  viewType?: ViewType;
}

const DealListings = ({ 
  categorySlug, 
  shopSlug, 
  sortBy = 'hot', 
  searchQuery,
  viewType: externalViewType
}: DealListingsProps) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [viewType, setViewType] = useState<ViewType>(externalViewType || 'grid');

  // Update internal viewType when external prop changes
  useEffect(() => {
    if (externalViewType) {
      setViewType(externalViewType);
    }
  }, [externalViewType]);

  useEffect(() => {
    console.log('DealListings - Fetching deals with params:', { categorySlug, shopSlug, sortBy, searchQuery });
    fetchDeals(true);
  }, [categorySlug, shopSlug, sortBy, searchQuery]);

  const fetchDeals = async (initialLoad = false) => {
    if (initialLoad) {
      setPage(1);
      setHasMore(true);
      setLoading(true);
    }

    let query = supabase
      .from('deals')
      .select(`
        *,
        categories(name, slug),
        shops(name, slug, logo_url)
      `)
      .eq('status', 'approved');

    // Apply filters
    if (categorySlug && categorySlug !== 'all' && categorySlug !== '') {
      console.log('Filtering by category slug:', categorySlug);
      // Get category ID first
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      
      if (categoryData) {
        console.log('Found category ID:', categoryData.id);
        query = query.eq('category_id', categoryData.id);
      } else {
        console.log('Category not found for slug:', categorySlug);
      }
    }
    
    if (shopSlug && shopSlug !== 'all' && shopSlug !== '') {
      console.log('Filtering by shop slug:', shopSlug);
      // Get shop ID first
      const { data: shopData } = await supabase
        .from('shops')
        .select('id')
        .eq('slug', shopSlug)
        .single();
      
      if (shopData) {
        console.log('Found shop ID:', shopData.id);
        query = query.eq('shop_id', shopData.id);
      } else {
        console.log('Shop not found for slug:', shopSlug);
      }
    }
    
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%`);
    }

    // Apply sorting
    switch (sortBy) {
      case 'hot':
        query = query.order('heat_score', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'discount':
        query = query.order('discount_percentage', { ascending: false });
        break;
      case 'price_low':
        query = query.order('discounted_price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('discounted_price', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const currentPage = initialLoad ? 1 : page;
    query = query.range((currentPage - 1) * 12, currentPage * 12 - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching deals:', error);
    } else {
      console.log('Fetched deals:', data?.length || 0);
      const mappedDeals = (data || []).map(deal => ({
        ...deal,
        summary: deal.description || ''
      }));

      if (initialLoad) {
        setDeals(mappedDeals);
      } else {
        setDeals((prevDeals) => [...prevDeals, ...mappedDeals]);
      }

      if (data && data.length < 12) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    }

    setLoading(false);
  };

  const loadMoreDeals = async () => {
    setPage((prevPage) => prevPage + 1);
    await fetchDeals();
  };

  const renderDealCard = (deal: Deal) => {
    switch (viewType) {
      case 'full':
        return <DealCardFull key={deal.id} deal={deal} />;
      case 'compact':
        return <DealCardCompact key={deal.id} deal={deal} />;
      default:
        return <DealCard key={deal.id} deal={deal} />;
    }
  };

  const getGridClasses = () => {
    switch (viewType) {
      case 'full':
        return 'space-y-6';
      case 'compact':
        return 'space-y-2';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  const getSkeletonLayout = () => {
    if (viewType === 'full') {
      return (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  <Skeleton className="lg:w-80 h-48 lg:h-64" />
                  <div className="flex-1 p-6 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (viewType === 'compact') {
      return (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Deals</h2>
          <ViewSwitcher currentView={viewType} onViewChange={setViewType} />
        </div>
        {getSkeletonLayout()}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Deals</h2>
          <ViewSwitcher currentView={viewType} onViewChange={setViewType} />
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No deals found
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No deals found for "${searchQuery}"`
                : categorySlug 
                  ? `No deals found in this category. Check back soon for amazing deals!`
                  : "Check back soon for amazing deals and discounts!"
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {deals.length} Deal{deals.length !== 1 ? 's' : ''} Found
        </h2>
        {!externalViewType && (
          <ViewSwitcher currentView={viewType} onViewChange={setViewType} />
        )}
      </div>
      
      <InfiniteScroll
        dataLength={deals.length}
        next={loadMoreDeals}
        hasMore={hasMore}
        loader={getSkeletonLayout()}
      >
        <div className={getGridClasses()}>
          {deals.map((deal) => renderDealCard(deal))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default DealListings;
