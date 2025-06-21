
import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: object;
}

export const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage,
  structuredData
}: SEOHeadProps) => {
  useEffect(() => {
    // Set title
    if (title) {
      document.title = title;
    }

    // Helper function to update or create meta tags
    const updateMetaTag = (selector: string, content: string) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (selector.includes('property=')) {
          tag.setAttribute('property', selector.split('"')[1]);
        } else if (selector.includes('name=')) {
          tag.setAttribute('name', selector.split('"')[1]);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Update basic meta tags
    if (description) {
      updateMetaTag('meta[name="description"]', description);
    }
    if (keywords) {
      updateMetaTag('meta[name="keywords"]', keywords);
    }

    // Update Open Graph tags
    if (ogTitle) {
      updateMetaTag('meta[property="og:title"]', ogTitle);
    }
    if (ogDescription) {
      updateMetaTag('meta[property="og:description"]', ogDescription);
    }
    if (ogImage) {
      updateMetaTag('meta[property="og:image"]', ogImage);
    }
    if (ogUrl) {
      updateMetaTag('meta[property="og:url"]', ogUrl);
    }

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', twitterCard);
    if (twitterTitle) {
      updateMetaTag('meta[name="twitter:title"]', twitterTitle);
    }
    if (twitterDescription) {
      updateMetaTag('meta[name="twitter:description"]', twitterDescription);
    }
    if (twitterImage) {
      updateMetaTag('meta[name="twitter:image"]', twitterImage);
    }

    // Update canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }

    // Add structured data
    if (structuredData) {
      let structuredDataTag = document.querySelector('script[type="application/ld+json"]');
      if (!structuredDataTag) {
        structuredDataTag = document.createElement('script');
        structuredDataTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(structuredDataTag);
      }
      structuredDataTag.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, ogUrl, twitterCard, twitterTitle, twitterDescription, twitterImage, structuredData]);

  return null;
};
