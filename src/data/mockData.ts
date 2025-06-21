
export interface Deal {
  id: string;
  title: string;
  description: string;
  image: string;
  shopName: string;
  shopLogo: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  heatScore: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  views: number;
  expiry: string;
  category: string;
  affiliateLink: string;
  postedBy: string;
  postedTime: string;
}

export const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Samsung Galaxy S24 Ultra 256GB - Titanium Black',
    description: 'Latest flagship smartphone with S Pen, advanced camera system, and AI features. Perfect for productivity and photography enthusiasts.',
    image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=300&fit=crop',
    shopName: 'Amazon UK',
    shopLogo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=32&h=32&fit=crop',
    originalPrice: 1249,
    discountedPrice: 899,
    discountPercentage: 28,
    heatScore: 95,
    upvotes: 234,
    downvotes: 12,
    comments: 67,
    views: 1523,
    expiry: '2 days',
    category: 'Electronics',
    affiliateLink: 'https://amazon.co.uk/samsung-s24-ultra',
    postedBy: 'TechDealer',
    postedTime: '2 hours ago'
  },
  {
    id: '2',
    title: 'Apple AirPods Pro (2nd Generation) with MagSafe Case',
    description: 'Premium wireless earbuds with active noise cancellation, spatial audio, and all-day battery life.',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop',
    shopName: 'Currys',
    shopLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=32&h=32&fit=crop',
    originalPrice: 249,
    discountedPrice: 189,
    discountPercentage: 24,
    heatScore: 78,
    upvotes: 156,
    downvotes: 8,
    comments: 43,
    views: 892,
    expiry: '5 days',
    category: 'Electronics',
    affiliateLink: 'https://currys.co.uk/airpods-pro',
    postedBy: 'AudioFan',
    postedTime: '4 hours ago'
  },
  {
    id: '3',
    title: 'LEGO Creator 3-in-1 Deep Sea Creatures (31088)',
    description: 'Build a shark, squid, or anglerfish with this creative LEGO set. Perfect for kids and adult fans alike.',
    image: 'https://images.unsplash.com/photo-1558618667-fbd25c85cd64?w=400&h=300&fit=crop',
    shopName: 'Argos',
    shopLogo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=32&h=32&fit=crop',
    originalPrice: 15.99,
    discountedPrice: 9.99,
    discountPercentage: 38,
    heatScore: 65,
    upvotes: 89,
    downvotes: 5,
    comments: 23,
    views: 456,
    expiry: '1 week',
    category: 'Gaming',
    affiliateLink: 'https://argos.co.uk/lego-creator',
    postedBy: 'LegoLover',
    postedTime: '6 hours ago'
  },
  {
    id: '4',
    title: 'Nike Air Max 270 React Sneakers - Black/White',
    description: 'Comfortable running shoes with React foam cushioning and iconic Air Max styling.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
    shopName: 'JD Sports',
    shopLogo: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=32&h=32&fit=crop',
    originalPrice: 134.99,
    discountedPrice: 89.99,
    discountPercentage: 33,
    heatScore: 72,
    upvotes: 112,
    downvotes: 7,
    comments: 34,
    views: 678,
    expiry: '3 days',
    category: 'Fashion',
    affiliateLink: 'https://jdsports.co.uk/nike-air-max',
    postedBy: 'SneakerHead',
    postedTime: '8 hours ago'
  },
  {
    id: '5',
    title: 'Dyson V15 Detect Absolute Cordless Vacuum Cleaner',
    description: 'Advanced cordless vacuum with laser dust detection and powerful suction for all floor types.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    shopName: 'John Lewis',
    shopLogo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=32&h=32&fit=crop',
    originalPrice: 649,
    discountedPrice: 499,
    discountPercentage: 23,
    heatScore: 58,
    upvotes: 78,
    downvotes: 9,
    comments: 28,
    views: 543,
    expiry: '4 days',
    category: 'Home & Garden',
    affiliateLink: 'https://johnlewis.com/dyson-v15',
    postedBy: 'HomeHelper',
    postedTime: '12 hours ago'
  },
  {
    id: '6',
    title: 'PlayStation 5 Console + Spider-Man 2 Bundle',
    description: 'Latest PS5 console with the highly anticipated Spider-Man 2 game included.',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop',
    shopName: 'GAME',
    shopLogo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=32&h=32&fit=crop',
    originalPrice: 569.99,
    discountedPrice: 519.99,
    discountPercentage: 9,
    heatScore: 92,
    upvotes: 345,
    downvotes: 15,
    comments: 89,
    views: 2134,
    expiry: '1 day',
    category: 'Gaming',
    affiliateLink: 'https://game.co.uk/ps5-spiderman',
    postedBy: 'GamerDeals',
    postedTime: '1 hour ago'
  }
];

export const categories = [
  { id: '1', name: 'Electronics', count: 1234, icon: 'Smartphone' },
  { id: '2', name: 'Gaming', count: 856, icon: 'Gamepad2' },
  { id: '3', name: 'Fashion', count: 743, icon: 'Shirt' },
  { id: '4', name: 'Automotive', count: 432, icon: 'Car' },
  { id: '5', name: 'Home & Garden', count: 651, icon: 'Home' },
  { id: '6', name: 'Books', count: 289, icon: 'Book' },
  { id: '7', name: 'Food & Drinks', count: 387, icon: 'Utensils' },
  { id: '8', name: 'Health & Beauty', count: 512, icon: 'Shield' }
];

export const shops = [
  { id: '1', name: 'Amazon UK', logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=64&h=64&fit=crop', dealsCount: 2341 },
  { id: '2', name: 'Currys', logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop', dealsCount: 1456 },
  { id: '3', name: 'Argos', logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=64&h=64&fit=crop', dealsCount: 987 },
  { id: '4', name: 'John Lewis', logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=64&h=64&fit=crop', dealsCount: 756 },
  { id: '5', name: 'GAME', logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=64&h=64&fit=crop', dealsCount: 543 },
  { id: '6', name: 'JD Sports', logo: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=64&h=64&fit=crop', dealsCount: 432 }
];
