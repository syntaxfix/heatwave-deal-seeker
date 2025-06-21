
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, ExternalLink, Store, Eye } from 'lucide-react';
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

interface DealCardFullProps {
  deal: Deal;
}

const DealCardFull = ({ deal }: DealCardFullProps) => {
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
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Large Image Section */}
          <Link to={`/deal/${dealSlug}`} className="lg:w-80 flex-shrink-0">
            <div className="relative h-48 lg:h-64 bg-gray-100 overflow-hidden">
              {image_url ? (
                <img
                  src={image_url}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                  <Store className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {/* Large Discount Badge */}
              {discount_percentage > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 text-white text-lg px-3 py-1 font-bold">
                    -{discount_percentage}%
                  </Badge>
                </div>
              )}

              {/* View overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="limited-time" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Deal
                  </Button>
                </div>
              </div>
            </div>
          </Link>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between min-h-64">
            <div className="space-y-4">
              {/* Header with Shop */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link to={`/deal/${dealSlug}`}>
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                  </Link>
                </div>
                
                {shops && (
                  <Link 
                    to={`/shop/${shops.slug}`} 
                    className="flex items-center space-x-2 ml-4 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={shops.logo_url} />
                      <AvatarFallback className="text-sm">
                        {shops.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                      {shops.name}
                    </span>
                  </Link>
                )}
              </div>

              {/* Description */}
              {displayDescription && (
                <p className="text-gray-600 line-clamp-3 leading-relaxed">
                  {displayDescription}
                </p>
              )}

              {/* Category Badge */}
              {categories && (
                <Link to={`/category/${categories.slug}`}>
                  <Badge variant="secondary" className="hover:bg-primary hover:text-white transition-colors">
                    {categories.name}
                  </Badge>
                </Link>
              )}
            </div>

            {/* Bottom Section */}
            <div className="space-y-4">
              {/* Price Section */}
              {original_price > 0 && discounted_price > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(discounted_price)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(original_price)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 bg-green-100 px-2 py-1 rounded">
                    Save {formatPrice(original_price - discounted_price)}
                  </div>
                </div>
              )}

              {/* Meta Information */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true })}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <VotingSystem
                  dealId={id}
                  initialUpvotes={upvotes}
                  initialDownvotes={downvotes}
                  initialHeatScore={heat_score}
                />
                
                <div className="flex space-x-3">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/deal/${dealSlug}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  
                  {affiliate_link && (
                    <Button
                      asChild
                      variant="limited-time"
                      size="lg"
                      className="shadow-lg hover:shadow-xl"
                    >
                      <a
                        href={affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Get This Deal</span>
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCardFull;
