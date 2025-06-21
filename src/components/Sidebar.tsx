
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Store,
  Smartphone,
  Gamepad2,
  Shirt,
  Car,
  Home as HomeIcon,
  Book,
  Utensils,
  Shield
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

const iconMap: { [key: string]: any } = {
  Smartphone,
  Gamepad2,
  Shirt,
  Car,
  Home: HomeIcon,
  Book,
  Utensils,
  Shield
};

const Sidebar = () => {
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const mainNavItems = [
    { 
      path: '/', 
      label: 'Home', 
      icon: Home,
      active: location.pathname === '/'
    },
    { 
      path: '/?sort=hot', 
      label: 'Hot Deals', 
      icon: TrendingUp,
      active: location.search.includes('sort=hot')
    },
    { 
      path: '/?sort=newest', 
      label: 'Recent', 
      icon: Clock,
      active: location.search.includes('sort=newest') || location.pathname === '/'
    },
    { 
      path: '/blog', 
      label: 'Blog', 
      icon: BookOpen,
      active: location.pathname.startsWith('/blog')
    },
    { 
      path: '/shops', 
      label: 'Shops', 
      icon: Store,
      active: location.pathname.startsWith('/shop')
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-16 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Main Navigation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-900">
              Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    item.active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-900">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] || Smartphone;
              const isActive = location.pathname === `/category/${category.slug}`;
              
              return (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-900">
              Community Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Deals</span>
              <Badge variant="secondary">2,847</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today's Votes</span>
              <Badge variant="secondary">1,234</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Online Users</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                456
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};

export default Sidebar;
