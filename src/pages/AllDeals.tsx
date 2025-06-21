
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';
import Header from '@/components/Header';
import DealListings from '@/components/DealListings';
import FilterBar from '@/components/FilterBar';
import { ViewType } from '@/components/ViewSwitcher';
import { Package } from 'lucide-react';
import { categories } from '@/data/categories';
import { SEOHead } from '@/components/SEOHead';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface Shop {
  id: string;
  name: string;
  slug: string;
}

const AllDeals = () => {
  const { currency, currencySymbol } = useCurrency();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [sortBy, setSortBy] = useState('hot');
  const [viewType, setViewType] = useState<ViewType>('grid');

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "All Deals" }
  ];

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    const { data: shopsData } = await supabase
      .from('shops')
      .select('*')
      .order('name');
    
    if (shopsData) setShops(shopsData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="All Deals - DealSpark | Hottest Deals & Discounts"
        description="Discover amazing deals from all categories and stores. Find the hottest discounts, voted by our community of deal hunters."
        keywords="deals, discounts, offers, savings, shopping, bargains"
        canonical={`${window.location.origin}/deals`}
        ogTitle="All Deals - DealSpark"
        ogDescription="Discover amazing deals from all categories and stores"
        ogUrl={`${window.location.origin}/deals`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "All Deals",
          "description": "Collection of the hottest deals and discounts",
          "url": `${window.location.origin}/deals`
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
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">All Deals</h1>
            </div>
            <p className="text-gray-600">
              Discover amazing deals from all categories and stores
            </p>
          </div>

          {/* Filter Bar with View Switcher */}
          <FilterBar
            categories={categories}
            shops={shops}
            selectedCategory={selectedCategory}
            selectedShop={selectedShop}
            sortBy={sortBy}
            viewType={viewType}
            onCategoryChange={setSelectedCategory}
            onShopChange={setSelectedShop}
            onSortChange={setSortBy}
            onViewChange={setViewType}
            showViewSwitcher={true}
          />

          {/* Deal Listings */}
          <DealListings
            categorySlug={selectedCategory}
            shopSlug={selectedShop}
            sortBy={sortBy}
            viewType={viewType}
          />
        </div>
      </div>
    </div>
  );
};

export default AllDeals;
