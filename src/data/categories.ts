
import { 
  Smartphone, 
  Gamepad2, 
  Shirt, 
  Car, 
  Home as HomeIcon,
  Book,
  Utensils,
  Shield
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: any;
  count: number;
}

export const categories: Category[] = [
  { 
    id: '1',
    name: 'Electronics', 
    slug: 'electronics',
    description: 'Latest gadgets, smartphones, laptops, and tech accessories at unbeatable prices',
    icon: Smartphone, 
    count: 1234 
  },
  { 
    id: '2',
    name: 'Gaming', 
    slug: 'gaming',
    description: 'Video games, consoles, accessories, and gaming gear for all platforms',
    icon: Gamepad2, 
    count: 856 
  },
  { 
    id: '3',
    name: 'Fashion', 
    slug: 'fashion',
    description: 'Clothing, shoes, accessories, and style essentials for men and women',
    icon: Shirt, 
    count: 743 
  },
  { 
    id: '4',
    name: 'Automotive', 
    slug: 'automotive',
    description: 'Car accessories, tools, parts, and automotive essentials',
    icon: Car, 
    count: 432 
  },
  { 
    id: '5',
    name: 'Home & Garden', 
    slug: 'home-garden',
    description: 'Home decor, furniture, garden tools, and household essentials',
    icon: HomeIcon, 
    count: 651 
  },
  { 
    id: '6',
    name: 'Books', 
    slug: 'books',
    description: 'Books, e-books, audiobooks, and educational materials',
    icon: Book, 
    count: 289 
  },
  { 
    id: '7',
    name: 'Food & Drinks', 
    slug: 'food-drinks',
    description: 'Groceries, beverages, snacks, and gourmet food items',
    icon: Utensils, 
    count: 387 
  },
  { 
    id: '8',
    name: 'Health & Beauty', 
    slug: 'health-beauty',
    description: 'Cosmetics, skincare, wellness products, and health supplements',
    icon: Shield, 
    count: 512 
  }
];
