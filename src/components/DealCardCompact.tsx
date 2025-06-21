
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, ExternalLink, Store } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import VotingSystem from './VotingSystem';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/hooks/useCurrency';

interface Deal {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  image_url?: string;
  original_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  slug?: string;
  created_at: string;
  upvotes?: number;
  downvotes?: number;
  heat_score?: number;
  affiliate_link?: string;
  categories?: { name: string; slug: string };
  shops?: { name: string; slug: string; logo_url?: string };
}

interface DealCardCompactProps {
  deal: Deal;
}

const DealCardCompact = ({ deal }: DealCardCompactProps) => {
  const { formatPrice } = useCurrency();
  const {
    id,
    title,
    description,
    summary,
    image_url,
    original_price = 0,
    discounted_price = 0,
    discount_percentage = 0,
    slug,
    created_at,
    upvotes = 0,
    downvotes = 0,
    heat_score = 0,
    affiliate_link,
    categories,
    shops
  } = deal;

  const displayDescription = description || summary || '';
  const dealSlug = slug || id;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center space-x-4 p-4">
          {/* Compact Image */}
          <Link to={`/deal/${dealSlug}`} className="flex-shrink-0">
            <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              {image_url ? (
                <img
                  src={image_url}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                  <Store className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              {/* Compact Discount Badge */}
              {discount_percentage > 0 && (
                <div className="absolute -top-1 -right-1">
                  <Badge className="bg-red-600 text-white text-xs px-1 py-0.5">
                    {discount_percentage}%
                  </Badge>
                </div>
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and Shop */}
            <div className="flex items-start justify-between">
              <Link to={`/deal/${dealSlug}`} className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors text-sm">
                  {title}
                </h3>
              </Link>
              
              {shops && (
                <Link to={`/shop/${shops.slug}`} className="flex items-center space-x-1 ml-2 flex-shrink-0 hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={shops.logo_url} />
                    <AvatarFallback className="text-xs">
                      {shops.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600 hover:text-primary transition-colors">{shops.name}</span>
                </Link>
              )}
            </div>

            {/* Price and Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Price */}
                {original_price > 0 && discounted_price > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(discounted_price)}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      {formatPrice(original_price)}
                    </span>
                  </div>
                )}
              </div>

              {/* Time */}
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <VotingSystem
                dealId={id}
                initialUpvotes={upvotes}
                initialDownvotes={downvotes}
                initialHeatScore={heat_score}
                compact={true}
              />
              
              {affiliate_link && (
                <Button
                  asChild
                  variant="limited-time"
                  size="sm"
                  className="text-xs px-3 py-1.5 h-auto"
                >
                  <a
                    href={affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Get Deal</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCardCompact;
