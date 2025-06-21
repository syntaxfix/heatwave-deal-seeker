import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import DealListings from '@/components/DealListings';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Tag } from 'lucide-react';
import { ViewType } from '@/components/ViewSwitcher';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedShop, setSelectedShop] = useState('');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  const fetchFiltersData = async () => {
    // Fetch categories for filter
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, slug');
    
    // Fetch shops for filter
    const { data: shopsData } = await supabase
      .from('shops')
      .select('id, name, slug');

    if (categoriesData) setCategories(categoriesData);
    if (shopsData) setShops(shopsData);
  };

  const fetchCategoryData = async () => {
    if (!slug) return;

    setLoading(true);

    // Fetch category details
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (categoryError) {
      console.error('Error fetching category:', categoryError);
      setLoading(false);
      return;
    }

    setCategory(categoryData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="mb-8">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
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

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Category not found
            </h1>
            <p className="text-gray-600 mb-6">
              The category you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.name} Deals
            </h1>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
          </div>

          <FilterBar 
            categories={categories}
            shops={shops}
            selectedCategory={slug || ''}
            selectedShop={selectedShop}
            sortBy={sortBy}
            viewType={viewType}
            onCategoryChange={() => {}} // Disabled in category page
            onShopChange={setSelectedShop}
            onSortChange={setSortBy}
            onViewChange={setViewType}
            showViewSwitcher={true}
          />

          {/* Deal Listings */}
          <DealListings
            categorySlug={slug}
            shopSlug={selectedShop}
            sortBy={sortBy}
            viewType={viewType}
          />
        </div>
      </div>
    </div>
  );
};

export default Category;
