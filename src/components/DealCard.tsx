
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, ExternalLink, Store } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import VotingSystem from './VotingSystem';
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

interface DealCardProps {
  deal: Deal;
}

const DealCard = ({ deal }: DealCardProps) => {
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
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md">
      <CardContent className="p-0">
        {/* Image Section */}
        <Link to={`/deal/${dealSlug}`}>
          <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
            {image_url ? (
              <img
                src={image_url}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                <Store className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Discount Badge */}
            {discount_percentage > 0 && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-600 hover:bg-green-700 text-white font-bold">
                  {discount_percentage}% OFF
                </Badge>
              </div>
            )}
          </div>
        </Link>

        <div className="p-4 space-y-3">
          {/* Category and Shop */}
          <div className="flex items-center justify-between">
            {categories && (
              <Link 
                to={`/category/${categories.slug}`}
                className="text-xs text-primary hover:underline font-medium"
              >
                {categories.name}
              </Link>
            )}
            {shops && (
              <div className="flex items-center space-x-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={shops.logo_url} />
                  <AvatarFallback className="text-xs">
                    {shops.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Link 
                  to={`/shop/${shops.slug}`}
                  className="text-xs text-gray-600 hover:text-primary"
                >
                  {shops.name}
                </Link>
              </div>
            )}
          </div>

          {/* Title */}
          <Link to={`/deal/${dealSlug}`}>
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>

          {/* Description */}
          {displayDescription && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {displayDescription}
            </p>
          )}

          {/* Price Section */}
          {original_price > 0 && discounted_price > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-green-600">
                {formatPrice(discounted_price)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(original_price)}
              </span>
            </div>
          )}

          {/* Voting and Time */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <VotingSystem
              dealId={id}
              initialUpvotes={upvotes}
              initialDownvotes={downvotes}
              initialHeatScore={heat_score}
            />
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Action Button */}
          {affiliate_link && (
            <Button
              asChild
              variant="limited-time"
              className="w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={affiliate_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Get Deal</span>
                <ExternalLink className="h-3 w-3 ml-2" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCard;
