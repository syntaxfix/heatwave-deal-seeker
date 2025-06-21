
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import VotingSystem from '@/components/VotingSystem';
import CommentSection from '@/components/CommentSection';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  ExternalLink, 
  Share2, 
  Clock, 
  Tag, 
  Store, 
  Eye,
  Calendar,
  AlertCircle,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  images?: string[];
  original_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  affiliate_link?: string;
  created_at: string;
  expires_at?: string;
  upvotes: number;
  downvotes: number;
  heat_score: number;
  views: number;
  user_id?: string;
  categories?: { name: string; slug: string };
  shops?: { name: string; slug: string; logo_url?: string };
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
}

interface Profile {
  username?: string;
  full_name?: string;
}

const DealDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [dealAuthor, setDealAuthor] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedDeals, setRelatedDeals] = useState<Deal[]>([]);

  useEffect(() => {
    if (slug) {
      fetchDeal();
    }
  }, [slug]);

  useEffect(() => {
    if (deal) {
      incrementViews();
      fetchRelatedDeals();
      if (deal.user_id) {
        fetchDealAuthor(deal.user_id);
      }

      // Set meta tags
      document.title = deal.meta_title || `${deal.title} - DealSpark`;
      
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (metaDescriptionTag) {
        metaDescriptionTag.setAttribute('content', deal.meta_description || deal.description || `Find the best deal for ${deal.title}.`);
      }

      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', deal.canonical_url || window.location.href);
    }
  }, [deal]);

  const fetchDeal = async () => {
    try {
      console.log('Fetching deal with slug:', slug);
      
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          categories(name, slug),
          shops(name, slug, logo_url)
        `)
        .eq('slug', slug)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) {
        console.error('Error fetching deal:', error);
        return;
      }

      if (data) {
        console.log('Found deal:', data);
        setDeal(data as Deal);
      } else {
        console.log('No deal found with slug:', slug);
      }
    } catch (error) {
      console.error('Error fetching deal:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDealAuthor = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching deal author:', error);
        return;
      }

      if (data) {
        setDealAuthor(data);
      }
    } catch (error) {
      console.error('Error fetching deal author:', error);
    }
  };

  const incrementViews = async () => {
    if (!deal) return;
    
    try {
      await supabase
        .from('deals')
        .update({ views: (deal.views || 0) + 1 })
        .eq('id', deal.id);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const fetchRelatedDeals = async () => {
    if (!deal) return;

    try {
      let query = supabase
        .from('deals')
        .select(`
          *,
          categories(name, slug),
          shops(name, slug, logo_url)
        `)
        .eq('status', 'approved')
        .neq('id', deal.id)
        .limit(4);

      const { data } = await query.order('heat_score', { ascending: false });
      
      if (data) {
        setRelatedDeals(data as Deal[]);
      }
    } catch (error) {
      console.error('Error fetching related deals:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: deal?.title,
          text: deal?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleGetDeal = () => {
    if (deal?.affiliate_link) {
      window.open(deal.affiliate_link, '_blank', 'noopener,noreferrer');
    }
  };

  const isExpired = deal?.expires_at && new Date(deal.expires_at) < new Date();

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </>
    );
  }

  if (!deal) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Card>
            <CardContent className="pt-6">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Deal Not Found</h2>
              <p className="text-gray-600 mb-4">
                The deal you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/">
                <Button>Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  {/* Deal Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                    <div className="flex-1 mb-4 sm:mb-0">
                      <h1 className="text-2xl md:text-3xl font-bold mb-2">{deal.title}</h1>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(deal.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {deal.views || 0} views
                        </div>
                        {dealAuthor?.username && (
                          <div>
                            by {dealAuthor.full_name || dealAuthor.username}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <VotingSystem
                        dealId={deal.id}
                        initialUpvotes={deal.upvotes}
                        initialDownvotes={deal.downvotes}
                        initialHeatScore={deal.heat_score}
                      />
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Deal Image */}
                  {deal.image_url && (
                    <div className="mb-6">
                      <img
                        src={deal.image_url}
                        alt={deal.title}
                        className="w-full h-64 md:h-96 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Price Information */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="mb-4 sm:mb-0">
                        <div className="flex items-center space-x-3 mb-2">
                          {deal.original_price && deal.discounted_price && (
                            <>
                              <span className="text-2xl font-bold text-green-600">
                                {formatPrice(deal.discounted_price)}
                              </span>
                              <span className="text-lg text-gray-500 line-through">
                                {formatPrice(deal.original_price)}
                              </span>
                              {deal.discount_percentage && (
                                <Badge variant="destructive" className="text-sm">
                                  -{deal.discount_percentage}% OFF
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        {deal.expires_at && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {isExpired ? (
                              <span className="text-red-600">Expired</span>
                            ) : (
                              `Expires: ${new Date(deal.expires_at).toLocaleDateString()}`
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={handleGetDeal}
                        disabled={isExpired || !deal.affiliate_link}
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {isExpired ? 'Deal Expired' : 'Get This Deal'}
                      </Button>
                    </div>
                  </div>

                  {/* Deal Description */}
                  {deal.description && (
                    <div className="prose max-w-none mb-6">
                      <p className="text-gray-700 leading-relaxed">{deal.description}</p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {deal.categories && (
                      <Link to={`/category/${deal.categories.slug}`}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-gray-300">
                          <Tag className="h-3 w-3 mr-1" />
                          {deal.categories.name}
                        </Badge>
                      </Link>
                    )}
                    {deal.shops && (
                      <Link to={`/shop/${deal.shops.slug}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                          <Store className="h-3 w-3 mr-1" />
                          {deal.shops.name}
                        </Badge>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <CommentSection dealId={deal.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Shop Info */}
              {deal.shops && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Store className="h-5 w-5 mr-2" />
                      Shop Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/shop/${deal.shops.slug}`} className="block group">
                      <div className="flex items-center space-x-3">
                        {deal.shops.logo_url ? (
                          <img
                            src={deal.shops.logo_url}
                            alt={deal.shops.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {deal.shops.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold group-hover:text-blue-600">
                            {deal.shops.name}
                          </h3>
                          <p className="text-sm text-gray-600">View all deals</p>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Deal Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Deal Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                      Upvotes
                    </span>
                    <span className="font-semibold">{deal.upvotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                      Heat Score
                    </span>
                    <span className="font-semibold">{deal.heat_score}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-gray-500" />
                      Views
                    </span>
                    <span className="font-semibold">{deal.views || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Related Deals */}
              {relatedDeals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Deals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedDeals.map((relatedDeal) => (
                      <Link
                        key={relatedDeal.id}
                        to={`/deal/${relatedDeal.slug}`}
                        className="block group"
                      >
                        <div className="flex space-x-3">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {relatedDeal.image_url && (
                              <img
                                src={relatedDeal.image_url}
                                alt={relatedDeal.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-600">
                              {relatedDeal.title}
                            </h4>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {relatedDeal.heat_score}°
                              </Badge>
                              {relatedDeal.discount_percentage && (
                                <Badge variant="destructive" className="text-xs">
                                  -{relatedDeal.discount_percentage}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DealDetail;
