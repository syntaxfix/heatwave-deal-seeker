
import { supabase } from '../../src/integrations/supabase/client';

export type Data = {
  shops: any[];
};

export default async function data(): Promise<Data> {
  try {
    const { data: shops } = await supabase.rpc('get_shops_with_counts');
    
    return {
      shops: shops || []
    };
  } catch (error) {
    console.error('Error fetching shops:', error);
    return {
      shops: []
    };
  }
}
