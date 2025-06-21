
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Tag, List, ShoppingBag, Newspaper, Package, FileText } from 'lucide-react';

const fetchCounts = async () => {
  const [
    { count: dealsCount },
    { count: usersCount },
    { count: categoriesCount },
    { count: tagsCount },
    { count: shopsCount },
    { count: blogPostsCount },
    { count: staticPagesCount }
  ] = await Promise.all([
    supabase.from('deals').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('tags').select('*', { count: 'exact', head: true }),
    supabase.from('shops').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
    supabase.from('static_pages').select('*', { count: 'exact', head: true }),
  ]);

  return {
    deals: dealsCount ?? 0,
    users: usersCount ?? 0,
    categories: categoriesCount ?? 0,
    tags: tagsCount ?? 0,
    shops: shopsCount ?? 0,
    blogPosts: blogPostsCount ?? 0,
    staticPages: staticPagesCount ?? 0,
  };
};

const StatCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export const DashboardOverview = () => {
  const { data: counts, isLoading } = useQuery({ queryKey: ['dashboardCounts'], queryFn: fetchCounts });

  if (isLoading) {
    return <div className="p-4">Loading stats...</div>;
  }
  
  const stats = [
    { title: 'Total Deals', value: counts?.deals, icon: Package },
    { title: 'Total Users', value: counts?.users, icon: Users },
    { title: 'Total Categories', value: counts?.categories, icon: List },
    { title: 'Total Tags', value: counts?.tags, icon: Tag },
    { title: 'Total Shops', value: counts?.shops, icon: ShoppingBag },
    { title: 'Total Blog Posts', value: counts?.blogPosts, icon: Newspaper },
    { title: 'Total Static Pages', value: counts?.staticPages, icon: FileText },
  ];

  return (
    <div className="p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => stat.value !== undefined && <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} />)}
      </div>
    </div>
  );
};
