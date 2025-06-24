import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const SitemapRedirect = () => {
  const { type } = useParams();
  const location = useLocation();

  useEffect(() => {
    const redirectToSitemap = () => {
      const searchParams = new URLSearchParams(location.search);
      
      // Build the edge function URL
      const baseUrl = `${window.location.origin}/functions/v1/sitemap`;
      const params = new URLSearchParams();
      
      if (type) {
        params.set('type', type);
      }
      
      // Copy over any query parameters
      searchParams.forEach((value, key) => {
        params.set(key, value);
      });
      
      const finalUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
      
      // Redirect to the edge function
      window.location.href = finalUrl;
    };

    redirectToSitemap();
  }, [type, location.search]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <p>Redirecting to sitemap...</p>
    </div>
  );
};

export default SitemapRedirect;