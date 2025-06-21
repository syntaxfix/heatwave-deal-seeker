
// This file is used to insert sample deals into the database
import { supabase } from '@/integrations/supabase/client';

export const insertSampleDeals = async () => {
  // First, get category and shop IDs
  const { data: categories } = await supabase.from('categories').select('id, slug');
  const { data: shops } = await supabase.from('shops').select('id, slug');

  if (!categories || !shops) return;

  const electronicsCategory = categories.find(c => c.slug === 'electronics')?.id;
  const gamingCategory = categories.find(c => c.slug === 'gaming')?.id;
  const fashionCategory = categories.find(c => c.slug === 'fashion')?.id;
  
  const amazonShop = shops.find(s => s.slug === 'amazon')?.id;
  const bestBuyShop = shops.find(s => s.slug === 'best-buy')?.id;
  const nikeShop = shops.find(s => s.slug === 'nike')?.id;

  const sampleDeals = [
    {
      title: 'Apple iPhone 15 Pro -50% Off Limited Time',
      description: 'Get the latest iPhone 15 Pro with incredible features at an unbeatable price. Limited stock available!',
      image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=300&fit=crop',
      original_price: 999.99,
      discounted_price: 499.99,
      discount_percentage: 50,
      category_id: electronicsCategory,
      shop_id: amazonShop,
      status: 'approved',
      heat_score: 95,
      upvotes: 234,
      downvotes: 12,
      affiliate_link: 'https://amazon.com/iphone-15-pro'
    },
    {
      title: 'Sony WH-1000XM5 Noise Canceling Headphones',
      description: 'Industry-leading noise cancellation with premium sound quality. Perfect for travel and work.',
      image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&h=300&fit=crop',
      original_price: 399.99,
      discounted_price: 279.99,
      discount_percentage: 30,
      category_id: electronicsCategory,
      shop_id: bestBuyShop,
      status: 'approved',
      heat_score: 88,
      upvotes: 156,
      downvotes: 8,
      affiliate_link: 'https://bestbuy.com/sony-headphones'
    },
    {
      title: 'PlayStation 5 Console Bundle',
      description: 'PS5 console with extra controller and 3 games. Free shipping included!',
      image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&h=300&fit=crop',
      original_price: 699.99,
      discounted_price: 599.99,
      discount_percentage: 14,
      category_id: gamingCategory,
      shop_id: amazonShop,
      status: 'approved',
      heat_score: 92,
      upvotes: 312,
      downvotes: 23,
      affiliate_link: 'https://amazon.com/ps5-bundle'
    },
    {
      title: 'Nike Air Max 270 Sneakers - 40% Off',
      description: 'Comfortable and stylish sneakers perfect for everyday wear. Multiple colors available.',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=300&fit=crop',
      original_price: 150.00,
      discounted_price: 89.99,
      discount_percentage: 40,
      category_id: fashionCategory,
      shop_id: nikeShop,
      status: 'approved',
      heat_score: 76,
      upvotes: 89,
      downvotes: 15,
      affiliate_link: 'https://nike.com/air-max-270'
    },
    {
      title: '4K Smart TV 55" - Massive Savings',
      description: 'Ultra HD Smart TV with HDR support and streaming apps built-in. Perfect for movie nights!',
      image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=300&fit=crop',
      original_price: 899.99,
      discounted_price: 549.99,
      discount_percentage: 39,
      category_id: electronicsCategory,
      shop_id: bestBuyShop,
      status: 'approved',
      heat_score: 84,
      upvotes: 142,
      downvotes: 18,
      affiliate_link: 'https://bestbuy.com/smart-tv-55'
    }
  ];

  const { error } = await supabase.from('deals').insert(sampleDeals);
  
  if (error) {
    console.error('Error inserting sample deals:', error);
  } else {
    console.log('Sample deals inserted successfully!');
  }
};
