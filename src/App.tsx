
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Footer from "./components/Footer";
import DealDetail from "./pages/DealDetail";
import ShopDetail from "./pages/ShopDetail";
import Category from "./pages/Category";
import TagPage from "./pages/TagPage";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import { CurrencyProvider } from "./hooks/useCurrency";
import SitemapRedirect from "./components/SitemapRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CurrencyProvider>
        <Toaster />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <Routes>
                {navItems.map(({ to, page }) => {
                  if (to === "*") {
                    return <Route key="404" path="*" element={page} />;
                  }
                  return <Route key={to} path={to} element={page} />;
                })}
                
                {/* Dynamic routes for deal details, shop details, etc. */}
                <Route path="/deal/:slug" element={<DealDetail />} />
                <Route path="/shop/:slug" element={<ShopDetail />} />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/tag/:slug" element={<TagPage />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/page/:slug" element={navItems.find(item => item.to === "/page/:slug")?.page} />
                
                {/* Sitemap routes - redirect to edge function */}
                <Route path="/sitemap.xml" element={<SitemapRedirect />} />
                <Route path="/sitemap-:type.xml" element={<SitemapRedirect />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
