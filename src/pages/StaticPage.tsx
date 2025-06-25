
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface StaticPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
}

const StaticPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<StaticPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchStaticPage();
    }
  }, [slug]);

  const fetchStaticPage = async () => {
    if (!slug) return;
    
    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_visible', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching static page:', error);
      setPage(null);
    } else {
      setPage(data);
    }
    
    setLoading(false);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: page?.title || "Page" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-4 w-32 mb-6" />
            <Skeleton className="h-12 w-3/4 mb-6" />
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Page not found
            </h1>
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={page.meta_title || `${page.title} - Spark.deals`}
        description={page.meta_description || `Learn more about ${page.title} on Spark.deals.`}
        keywords={page.meta_keywords || undefined}
        canonical={page.canonical_url || `${window.location.origin}/${page.slug}`}
        ogTitle={page.meta_title || page.title}
        ogDescription={page.meta_description || `Learn more about ${page.title} on Spark.deals.`}
        ogUrl={`${window.location.origin}/${page.slug}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": page.title,
          "description": page.meta_description || `Learn more about ${page.title} on Spark.deals.`,
          "url": `${window.location.origin}/${page.slug}`
        }}
      />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.title}</h1>
          
          <Card>
            <CardContent className="pt-6">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
