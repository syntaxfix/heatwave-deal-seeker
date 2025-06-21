
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CurrencyContextType {
  currency: string;
  currencySymbol: string;
  country: string;
  formatPrice: (price: number) => string;
  updateCurrency: (currencyCode: string, countryName: string) => void;
}

const currencies = {
  USD: { symbol: '$', country: 'United States' },
  GBP: { symbol: '£', country: 'United Kingdom' },
  EUR: { symbol: '€', country: 'Europe' },
  CAD: { symbol: 'C$', country: 'Canada' },
  INR: { symbol: '₹', country: 'India' },
  AUD: { symbol: 'A$', country: 'Australia' },
  JPY: { symbol: '¥', country: 'Japan' },
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('United States');

  useEffect(() => {
    // Load currency from localStorage first (for immediate effect)
    const storedCurrency = localStorage.getItem('site_currency');
    const storedCountry = localStorage.getItem('site_country');
    
    if (storedCurrency && currencies[storedCurrency as keyof typeof currencies]) {
      setCurrency(storedCurrency);
      setCountry(storedCountry || currencies[storedCurrency as keyof typeof currencies].country);
    }

    // Then fetch from database
    const fetchCurrencySettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['site_currency', 'site_country']);

        if (error) throw error;

        const settings = data.reduce((acc, { key, value }) => {
          if (key) acc[key] = value;
          return acc;
        }, {} as { [key: string]: string | null });

        if (settings.site_currency && currencies[settings.site_currency as keyof typeof currencies]) {
          setCurrency(settings.site_currency);
          localStorage.setItem('site_currency', settings.site_currency);
        }

        if (settings.site_country) {
          setCountry(settings.site_country);
          localStorage.setItem('site_country', settings.site_country);
        }
      } catch (error) {
        console.error('Error fetching currency settings:', error);
      }
    };

    fetchCurrencySettings();

    // Set up real-time subscription for currency changes
    const channel = supabase
      .channel('currency_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=in.(site_currency,site_country)'
        },
        (payload) => {
          console.log('Currency setting changed:', payload);
          if (payload.new && typeof payload.new === 'object' && 'key' in payload.new && 'value' in payload.new) {
            if (payload.new.key === 'site_currency') {
              const newCurrency = payload.new.value as string;
              if (currencies[newCurrency as keyof typeof currencies]) {
                setCurrency(newCurrency);
                localStorage.setItem('site_currency', newCurrency);
                setCountry(currencies[newCurrency as keyof typeof currencies].country);
                localStorage.setItem('site_country', currencies[newCurrency as keyof typeof currencies].country);
              }
            }
            if (payload.new.key === 'site_country') {
              setCountry(payload.new.value as string);
              localStorage.setItem('site_country', payload.new.value as string);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const currencySymbol = currencies[currency as keyof typeof currencies]?.symbol || '$';

  const formatPrice = (price: number) => {
    if (currency === 'INR') {
      // Indian number formatting with lakhs and crores
      return `${currencySymbol}${price.toLocaleString('en-IN')}`;
    }
    return `${currencySymbol}${price.toLocaleString()}`;
  };

  const updateCurrency = (currencyCode: string, countryName: string) => {
    if (currencies[currencyCode as keyof typeof currencies]) {
      setCurrency(currencyCode);
      setCountry(countryName);
      localStorage.setItem('site_currency', currencyCode);
      localStorage.setItem('site_country', countryName);
    }
  };

  const value = {
    currency,
    currencySymbol,
    country,
    formatPrice,
    updateCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
