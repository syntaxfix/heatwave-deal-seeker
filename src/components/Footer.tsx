
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  is_visible: boolean;
}

const Footer = () => {
  const [footerPages, setFooterPages] = useState<StaticPage[]>([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchFooterPages();
  }, []);

  const fetchFooterPages = async () => {
    try {
      const { data, error } = await supabase
        .from('static_pages')
        .select('id, title, slug, is_visible')
        .eq('is_visible', true)
        .order('title');

      if (error) {
        console.error('Error fetching footer pages:', error);
        return;
      }

      if (data) {
        setFooterPages(data);
      }
    } catch (error) {
      console.error('Error fetching footer pages:', error);
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DS</span>
              </div>
              <span className="text-xl font-bold">DealSpark</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Discover the hottest deals, voted by our community. Find amazing discounts and exclusive offers from top retailers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.141.663-1.992 1.488-1.992.702 0 1.041.527 1.041 1.219 0 .663-.421 1.658-.219 2.581.199.937.937 1.658 2.097 1.658 2.518 0 4.458-2.518 4.458-6.69 0-2.518-1.799-4.458-4.937-4.458-3.599 0-5.957 2.699-5.957 5.739 0 1.141.44 1.799 1.182 2.397.131.105.175.219.131.359-.105.359-.175.719-.175.719-.105.359-.44.527-.719.359-1.301-.719-2.097-2.518-2.097-4.458 0-3.318 2.397-6.237 7.179-6.237 3.599 0 6.690 2.518 6.690 6.690 0 4.458-2.518 7.618-6.237 7.618-1.219 0-2.397-.663-2.799-1.406 0 0-.663 2.518-.799 3.158-.263 1.014-1.095 2.518-1.658 3.439 1.406.44 2.518.659 3.918.659 6.690 0 12.088-5.367 12.088-11.987C24.105 5.367 18.707.029 12.017.029z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-gray-400 hover:text-white transition-colors">
                  All Deals
                </Link>
              </li>
              <li>
                <Link to="/shops" className="text-gray-400 hover:text-white transition-colors">
                  Shops
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/post-deal" className="text-gray-400 hover:text-white transition-colors">
                  Submit Deal
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  Join Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerPages.map((page) => (
                <li key={page.id}>
                  <Link 
                    to={`/page/${page.slug}`} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
              {footerPages.length === 0 && (
                <>
                  <li>
                    <Link to="/page/privacy" className="text-gray-400 hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/terms" className="text-gray-400 hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/about" className="text-gray-400 hover:text-white transition-colors">
                      About Us
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} DealSpark. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Made with ❤️ for deal hunters</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
