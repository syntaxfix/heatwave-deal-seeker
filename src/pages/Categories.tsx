
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag } from 'lucide-react';
import { categories as localCategories } from '@/data/categories';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: any;
  deal_count?: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    // Fetch categories from database
    const { data: categoriesData, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      // Use local categories as fallback
      setCategories(localCategories);
      setLoading(false);
      return;
    }

    // Merge with local categories to get icons and get deal counts
    const mergedCategories = await Promise.all(
      (categoriesData || []).map(async (dbCategory) => {
        const localCategory = localCategories.find(cat => cat.slug === dbCategory.slug);
        
        // Get deal count for this category
        const { count } = await supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', dbCategory.id)
          .eq('status', 'approved');

        return {
          ...dbCategory,
          icon: localCategory?.icon,
          deal_count: count || 0
        };
      })
    );

    setCategories(mergedCategories);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
            </div>
            <p className="text-gray-600">
              Browse deals by category to find exactly what you're looking for
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <Skeleton className="h-16 w-16 rounded-full mb-4" />
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="group"
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-blue-300 border-2 border-transparent bg-gradient-to-br from-white to-blue-50/30 h-full">
                      <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[180px]">
                        <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                          {IconComponent ? (
                            <div className="p-4 bg-blue-100 rounded-2xl group-hover:bg-blue-200 transition-colors">
                              <IconComponent className="h-10 w-10 text-blue-600" />
                            </div>
                          ) : (
                            <div className="h-18 w-18 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <span className="text-blue-600 font-bold text-2xl">{category.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
                          {category.name}
                        </CardTitle>
                        {category.description && (
                          <CardDescription className="text-xs text-gray-500 mb-3 line-clamp-2">
                            {category.description}
                          </CardDescription>
                        )}
                        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {category.deal_count || 0} deals
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
