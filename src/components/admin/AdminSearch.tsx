
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
  value?: string; // Add controlled value prop
  onChange?: (value: string) => void; // Add controlled onChange prop
}

export const AdminSearch = ({ 
  placeholder = "Search...", 
  onSearch, 
  className = "",
  value,
  onChange
}: AdminSearchProps) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  
  // Use controlled value if provided, otherwise use internal state
  const searchQuery = value !== undefined ? value : internalSearchQuery;
  const setSearchQuery = onChange || setInternalSearchQuery;

  // Stable callback to prevent infinite re-renders
  const stableOnSearch = useCallback(onSearch, [onSearch]);

  // Debounce search with better control
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('AdminSearch: debounced search triggered with:', searchQuery);
      stableOnSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, stableOnSearch]);

  const clearSearch = () => {
    console.log('AdminSearch: clearing search');
    setSearchQuery('');
    // Don't call onSearch here, let the useEffect handle it
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    console.log('AdminSearch: input changed to:', inputValue);
    setSearchQuery(inputValue);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
