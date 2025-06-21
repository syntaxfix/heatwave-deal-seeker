
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import DealListings from '@/components/DealListings';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, TrendingUp } from 'lucide-react';
import { categories } from '@/data/categories';

interface Shop {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
}

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [sortBy, setSortBy] = useState('hot');
  
  const query = searchParams.get('q') || '';

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

  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      setSearchParams({ q: newQuery });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {query ? `Search Results for "${query}"` : 'Search Deals'}
              </h1>
            </div>
            <p className="text-gray-600">
              {query ? `Find the best deals matching your search` : 'Enter a keyword to search for deals'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <SearchBar 
                  onSearch={handleSearch} 
                  placeholder="Search for deals, brands, or products..."
                />
              </CardContent>
            </Card>
          </div>

          {query ? (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="lg:w-3/4">
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

                {/* Search Results */}
                <DealListings
                  categorySlug={selectedCategory}
                  shopSlug={selectedShop}
                  sortBy={sortBy}
                  searchQuery={query}
                />
              </div>

              {/* Sidebar */}
              <div className="lg:w-1/4">
                <div className="sticky top-4 space-y-6">
                  {/* Search Tips */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-800 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Search Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-700 space-y-3">
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500">•</span>
                        <span>Try brand names (e.g., "Nike", "Apple")</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500">•</span>
                        <span>Search by product type (e.g., "laptop", "shoes")</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500">•</span>
                        <span>Use specific keywords for better results</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500">•</span>
                        <span>Filter by category or store</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Popular Searches */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Popular Searches</CardTitle>
                      <CardDescription>What others are looking for</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Books'].map((term) => (
                          <button
                            key={term}
                            onClick={() => handleSearch(term)}
                            className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Start Your Search
                </h3>
                <p className="text-gray-600 mb-6">
                  Enter a keyword in the search bar above to find amazing deals
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Electronics', 'Fashion', 'Home & Garden', 'Sports'].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
