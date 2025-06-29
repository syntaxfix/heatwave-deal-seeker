
import { supabase } from '../../src/integrations/supabase/client';

export type Data = {
  deals: any[];
  shops: any[];
};

export default async function data(): Promise<Data> {
  try {
    // Fetch featured deals
    const { data: deals } = await supabase
      .from('deals')
      .select(`
        *,
        shops (name, slug, logo_url),
        categories (name, slug),
        tags (name)
      `)
      .eq('status', 'approved')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(8);

    // Fetch shops with counts
    const { data: shops } = await supabase.rpc('get_shops_with_counts');

    return {
      deals: deals || [],
      shops: shops || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      deals: [],
      shops: []
    };
  }
}
