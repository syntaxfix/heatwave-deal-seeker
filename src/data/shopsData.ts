
export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  expiryDate: string;
  verified: boolean;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  website: string;
  category: string;
  activeDeals: number;
  coupons: Coupon[];
}

export const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Amazon',
    slug: 'amazon',
    description: 'World\'s largest online marketplace with millions of products at competitive prices.',
    logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&h=100&fit=crop',
    website: 'https://amazon.com',
    category: 'Marketplace',
    activeDeals: 45,
    coupons: [
      {
        id: '1',
        code: 'PRIME20',
        title: '20% off Prime eligible items',
        description: 'Save 20% on select Prime eligible items over £50',
        expiryDate: '2024-02-28',
        verified: true
      },
      {
        id: '2',
        code: 'NEWUSER10',
        title: '£10 off first order',
        description: 'New customers get £10 off orders over £25',
        expiryDate: '2024-12-31',
        verified: true
      }
    ]
  },
  {
    id: '2',
    name: 'ASOS',
    slug: 'asos',
    description: 'Leading online fashion destination for 20-somethings with over 850 brands.',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
    website: 'https://asos.com',
    category: 'Fashion',
    activeDeals: 23,
    coupons: [
      {
        id: '3',
        code: 'STUDENT15',
        title: '15% Student Discount',
        description: 'Students save 15% on full-price items',
        expiryDate: '2024-12-31',
        verified: true
      }
    ]
  },
  {
    id: '3',
    name: 'Currys',
    slug: 'currys',
    description: 'UK\'s leading tech retailer offering the latest gadgets, appliances, and electronics.',
    logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop',
    website: 'https://currys.co.uk',
    category: 'Electronics',
    activeDeals: 31,
    coupons: [
      {
        id: '4',
        code: 'TECHSAVE50',
        title: '£50 off tech over £500',
        description: 'Save £50 when you spend over £500 on tech products',
        expiryDate: '2024-01-31',
        verified: true
      }
    ]
  },
  {
    id: '4',
    name: 'John Lewis',
    slug: 'john-lewis',
    description: 'Premium department store known for quality products and excellent customer service.',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
    website: 'https://johnlewis.com',
    category: 'Department Store',
    activeDeals: 18,
    coupons: []
  },
  {
    id: '5',
    name: 'Argos',
    slug: 'argos',
    description: 'Digital retail leader offering same-day Fast Track delivery on thousands of products.',
    logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop',
    website: 'https://argos.co.uk',
    category: 'General Retail',
    activeDeals: 27,
    coupons: [
      {
        id: '5',
        code: 'FASTTRACK',
        title: 'Free Fast Track Delivery',
        description: 'Free same-day delivery on orders over £30',
        expiryDate: '2024-03-15',
        verified: false
      }
    ]
  },
  {
    id: '6',
    name: 'Next',
    slug: 'next',
    description: 'British multinational clothing, footwear and home products retailer.',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
    website: 'https://next.co.uk',
    category: 'Fashion',
    activeDeals: 15,
    coupons: []
  }
];
