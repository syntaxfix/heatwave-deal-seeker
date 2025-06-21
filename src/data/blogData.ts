
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImage: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  keywords: string[];
  metaDescription: string;
}

export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Best Money-Saving Apps You Need to Download Right Now',
    slug: 'best-money-saving-apps-2024',
    summary: 'Discover the top apps that will help you save money on groceries, cashback, and everyday purchases.',
    content: `
      <p>In today's digital age, saving money has never been easier thanks to innovative smartphone apps. Here are the 10 best money-saving apps that every savvy shopper should have on their phone.</p>
      
      <h2>1. Honey - Automatic Coupon Finder</h2>
      <p>Honey automatically finds and applies coupon codes at checkout for thousands of online stores. It's completely free and can save you significant amounts on your online purchases.</p>
      
      <h2>2. Rakuten - Cashback Rewards</h2>
      <p>Get cashback when shopping at over 3,500 stores. Rakuten offers up to 40% cashback at popular retailers and pays you quarterly.</p>
      
      <h2>3. Ibotta - Grocery Cashback</h2>
      <p>Earn cashback on groceries by scanning receipts and completing simple tasks. Perfect for everyday shopping at major grocery chains.</p>
      
      <h2>4. Mint - Budget Tracking</h2>
      <p>Keep track of your spending and create budgets to help you save more money each month. Mint provides detailed insights into your financial habits.</p>
      
      <h2>5. GasBuddy - Find Cheap Gas</h2>
      <p>Find the cheapest gas prices in your area and save money on fuel costs. The app is updated in real-time by a community of users.</p>
      
      <p>These apps can collectively save you hundreds of dollars per year when used consistently. Download them today and start saving!</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop',
    author: 'Sarah Johnson',
    publishDate: '2024-01-15',
    readTime: '5 min read',
    category: 'Apps & Technology',
    keywords: ['money saving apps', 'cashback', 'coupons', 'budgeting', 'shopping'],
    metaDescription: 'Discover the 10 best money-saving apps for 2024 that help you save on groceries, get cashback, and manage your budget effectively.'
  },
  {
    id: '2',
    title: 'Black Friday 2024: Ultimate Shopping Strategy Guide',
    slug: 'black-friday-2024-shopping-guide',
    summary: 'Master Black Friday with our comprehensive guide to finding the best deals and avoiding common shopping mistakes.',
    content: `
      <p>Black Friday is the biggest shopping event of the year, but without a proper strategy, you might miss out on the best deals or overspend. Here's your ultimate guide to conquering Black Friday 2024.</p>
      
      <h2>Pre-Black Friday Preparation</h2>
      <p>Start preparing weeks in advance by creating a wishlist, setting budgets, and researching regular prices so you can spot genuine deals.</p>
      
      <h2>Best Times to Shop</h2>
      <p>Early morning (6 AM - 10 AM) and late evening (8 PM - midnight) typically offer the best online deals with less competition.</p>
      
      <h2>Top Categories for Savings</h2>
      <ul>
        <li>Electronics: Up to 70% off TVs, laptops, and smartphones</li>
        <li>Home & Garden: Major appliances and furniture discounts</li>
        <li>Fashion: Clothing and accessories at 50-80% off</li>
        <li>Toys: Popular items for holiday shopping</li>
      </ul>
      
      <h2>Avoid These Common Mistakes</h2>
      <p>Don't fall for fake discounts, always compare prices across multiple retailers, and stick to your predetermined budget to avoid impulse purchases.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=400&fit=crop',
    author: 'Mike Chen',
    publishDate: '2024-01-10',
    readTime: '8 min read',
    category: 'Shopping Guides',
    keywords: ['black friday', 'shopping strategy', 'deals', 'discounts', 'holiday shopping'],
    metaDescription: 'Complete Black Friday 2024 shopping guide with expert strategies, best deal times, and tips to maximize your savings.'
  },
  {
    id: '3',
    title: 'How to Stack Coupons Like a Pro: Advanced Savings Techniques',
    slug: 'coupon-stacking-guide',
    summary: 'Learn advanced coupon stacking techniques to maximize your savings and get items for free or nearly free.',
    content: `
      <p>Coupon stacking is the art of combining multiple discounts on a single purchase. When done correctly, you can save 80-90% or even get items completely free.</p>
      
      <h2>Understanding Coupon Types</h2>
      <p>There are manufacturer coupons, store coupons, and digital coupons. Most stores allow you to stack one of each type on a single item.</p>
      
      <h2>The Best Stacking Opportunities</h2>
      <p>Look for items that are already on sale, then add manufacturer coupons, store coupons, and cashback apps for maximum savings.</p>
      
      <h2>Store Policies to Know</h2>
      <p>Each store has different coupon policies. CVS, Walgreens, and Target are known for generous stacking policies, while others may be more restrictive.</p>
      
      <h2>Digital Tools for Stackers</h2>
      <p>Use apps like Flipp, Checkout 51, and store-specific apps to find stackable offers and track your savings progress.</p>
      
      <p>Remember: coupon stacking requires patience and practice, but the savings can be substantial for dedicated deal hunters.</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    author: 'Lisa Thompson',
    publishDate: '2024-01-05',
    readTime: '6 min read',
    category: 'Couponing',
    keywords: ['coupon stacking', 'extreme couponing', 'free items', 'savings techniques', 'deal hunting'],
    metaDescription: 'Master coupon stacking with our comprehensive guide to advanced savings techniques and store policies.'
  }
];
