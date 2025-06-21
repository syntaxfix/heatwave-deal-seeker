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
        
        // Build parameters for the edge function
        const params: Record<string, string> = {
          baseUrl: window.location.origin // Pass the actual website URL
        };
        
        if (type) {
          params.type = type;
        }
        
        // Copy over any query parameters
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
        
        // Invoke the edge function
        const { data, error: functionError } = await supabase.functions.invoke('sitemap', {
          body: params
        });
        
        if (functionError) {
          throw functionError;
        }

        // The edge function returns XML content as a string
        const xmlContent = typeof data === 'string' ? data : JSON.stringify(data);
        
        // Create a data URL with the XML content
        const dataUrl = `data:application/xml;charset=utf-8,${encodeURIComponent(xmlContent)}`;
        
        // Navigate to the data URL to display the XML
        window.location.replace(dataUrl);
        
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

export default SitemapRedirect;