import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, SortAsc } from 'lucide-react';
import ViewSwitcher, { ViewType } from './ViewSwitcher';

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

interface FilterBarProps {
  categories: Category[];
  shops: Shop[];
  selectedCategory: string;
  selectedShop: string;
  sortBy: string;
  viewType?: ViewType;
  onCategoryChange: (value: string) => void;
  onShopChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onViewChange?: (view: ViewType) => void;
  showViewSwitcher?: boolean;
}

const FilterBar = ({
  categories,
  shops,
  selectedCategory,
  selectedShop,
  sortBy,
  viewType = 'grid',
  onCategoryChange,
  onShopChange,
  onSortChange,
  onViewChange,
  showViewSwitcher = false
}: FilterBarProps) => {
  const clearFilters = () => {
    onCategoryChange('all');
    onShopChange('all');
    onSortChange('hot');
  };

  const handleCategoryChange = (value: string) => {
    // Convert "all" back to empty string for the parent component
    onCategoryChange(value === 'all' ? '' : value);
  };

  const handleShopChange = (value: string) => {
    // Convert "all" back to empty string for the parent component
    onShopChange(value === 'all' ? '' : value);
  };

  // Convert empty strings to "all" for the Select component
  const categoryValue = selectedCategory === '' ? 'all' : selectedCategory;
  const shopValue = selectedShop === '' ? 'all' : selectedShop;

  return (
    <Card className="mb-6">
      <CardContent className="pt-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-1">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">Filter & Sort:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Category Filter */}
              <Select value={categoryValue} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Shop Filter */}
              <Select value={shopValue} onValueChange={handleShopChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Shops" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.slug}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">🔥 Hot</SelectItem>
                  <SelectItem value="newest">🆕 Newest</SelectItem>
                  <SelectItem value="discount">💰 Best Discount</SelectItem>
                  <SelectItem value="price_low">💷 Price: Low to High</SelectItem>
                  <SelectItem value="price_high">💷 Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(selectedCategory || selectedShop || sortBy !== 'hot') && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* View Switcher */}
          {showViewSwitcher && onViewChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 font-medium">View:</span>
              <ViewSwitcher currentView={viewType} onViewChange={onViewChange} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
