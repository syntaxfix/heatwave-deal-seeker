import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SitemapRedirect = () => {
  const { type } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const page = parseInt(searchParams.get('page') || '1');
        const baseUrl = window.location.origin;
        
        let xmlContent = '';
        
        if (!type || type === 'index') {
          xmlContent = await generateSitemapIndex(baseUrl);
        } else {
          xmlContent = await generateSpecificSitemap(type, baseUrl, page);
        }

        // Set the content type and serve the XML
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        // Replace current page with the XML content
        window.location.replace(`data:application/xml;charset=utf-8,${encodeURIComponent(xmlContent)}`);
        
      } catch (err) {
        console.error('Sitemap generation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate sitemap');
        setLoading(false);
      }
    };

    generateSitemap();
  }, [type, location.search]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Sitemap Error</h1>
        <p>Failed to generate sitemap: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <p>Generating sitemap...</p>
    </div>
  );
};

const generateSitemapIndex = async (baseUrl: string): Promise<string> => {
  // Count total items for each type
  const [dealsCount, shopsCount] = await Promise.all([
    supabase.from('deals').select('id', { count: 'exact', head: true }),
    supabase.from('shops').select('id', { count: 'exact', head: true }),
  ]);

  const dealsTotal = dealsCount.count || 0;
  const shopsTotal = shopsCount.count || 0;
  const limit = 1000;

  let sitemaps = [
    `    <sitemap>
      <loc>${baseUrl}/sitemap-static.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`,
    `    <sitemap>
      <loc>${baseUrl}/sitemap-blogs.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`,
  ];

  // Add paginated sitemaps for deals if needed
  const dealPages = Math.ceil(dealsTotal / limit);
  for (let i = 1; i <= dealPages; i++) {
    sitemaps.push(`    <sitemap>
      <loc>${baseUrl}/sitemap-deals.xml?page=${i}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`);
  }

  // Add paginated sitemaps for shops if needed
  const shopPages = Math.ceil(shopsTotal / limit);
  for (let i = 1; i <= shopPages; i++) {
    sitemaps.push(`    <sitemap>
      <loc>${baseUrl}/sitemap-shops.xml?page=${i}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('\n')}
</sitemapindex>`;
};

const generateSpecificSitemap = async (type: string, baseUrl: string, page: number): Promise<string> => {
  let urls: string[] = [];
  const limit = 1000;
  const offset = (page - 1) * limit;

  switch (type) {
    case 'static':
      urls = await getStaticUrls(baseUrl);
      break;
    case 'deals':
      urls = await getDealsUrls(baseUrl, limit, offset);
      break;
    case 'shops':
      urls = await getShopsUrls(baseUrl, limit, offset);
      break;
    case 'blogs':
      urls = await getBlogsUrls(baseUrl);
      break;
    default:
      throw new Error('Invalid sitemap type');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
};

const getStaticUrls = async (baseUrl: string): Promise<string[]> => {
  const urls = [
    createUrlEntry(baseUrl, '1.0', 'daily'),
    createUrlEntry(`${baseUrl}/deals`, '0.9', 'daily'),
    createUrlEntry(`${baseUrl}/shops`, '0.8', 'weekly'),
    createUrlEntry(`${baseUrl}/categories`, '0.7', 'weekly'),
    createUrlEntry(`${baseUrl}/blog`, '0.8', 'daily'),
    createUrlEntry(`${baseUrl}/contact`, '0.5', 'monthly'),
  ];

  // Add static pages
  const { data: staticPages } = await supabase
    .from('static_pages')
    .select('slug, updated_at')
    .eq('is_visible', true);

  if (staticPages) {
    staticPages.forEach(page => {
      urls.push(createUrlEntry(
        `${baseUrl}/page/${page.slug}`,
        '0.6',
        'monthly',
        page.updated_at
      ));
    });
  }

  // Add categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at');

  if (categories) {
    categories.forEach(category => {
      urls.push(createUrlEntry(
        `${baseUrl}/category/${category.slug}`,
        '0.7',
        'weekly',
        category.created_at
      ));
    });
  }

  return urls;
};

const getDealsUrls = async (baseUrl: string, limit: number, offset: number): Promise<string[]> => {
  const { data: deals } = await supabase
    .from('deals')
    .select('slug, updated_at')
    .eq('status', 'approved')
    .range(offset, offset + limit - 1)
    .order('updated_at', { ascending: false });

  if (!deals) return [];

  return deals.map(deal => 
    createUrlEntry(
      `${baseUrl}/deal/${deal.slug}`,
      '0.8',
      'daily',
      deal.updated_at
    )
  );
};

const getShopsUrls = async (baseUrl: string, limit: number, offset: number): Promise<string[]> => {
  const { data: shops } = await supabase
    .from('shops')
    .select('slug, created_at')
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (!shops) return [];

  return shops.map(shop =>
    createUrlEntry(
      `${baseUrl}/shop/${shop.slug}`,
      '0.7',
      'weekly',
      shop.created_at
    )
  );
};

const getBlogsUrls = async (baseUrl: string): Promise<string[]> => {
  const { data: blogs } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published');

  if (!blogs) return [];

  return blogs.map(blog =>
    createUrlEntry(
      `${baseUrl}/blog/${blog.slug}`,
      '0.8',
      'weekly',
      blog.updated_at
    )
  );
};

const createUrlEntry = (
  loc: string, 
  priority: string, 
  changefreq: string, 
  lastmod?: string
): string => {
  const lastmodTag = lastmod 
    ? `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>`
    : '';
  
  return `  <url>
    <loc>${loc}</loc>${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
};

export default SitemapRedirect;