
import { useState } from "react";
import { Menu, X, User, LogIn, UserPlus, LogOut, Settings, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const handleAdminClick = () => {
    if (profile?.role === 'root_admin') {
      navigate('/root/dashboard');
    } else {
      navigate('/profile');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Flame Icon */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <Link to="/" className="text-2xl font-bold text-primary">
              Spark.deals
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Desktop Navigation - Old Style */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/deals" className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md">
              All Deals
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md">
              Categories
            </Link>
            <Link to="/shops" className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md">
              Shops
            </Link>
            <Link to="/blog" className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md">
              Blog
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md">
              Contact
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {profile?.username || profile?.full_name || "Profile"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/post-deal")}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Post Deal
                  </DropdownMenuItem>
                  {(profile?.role === 'admin' || profile?.role === 'root_admin' || profile?.role === 'moderator') && (
                    <DropdownMenuItem onClick={handleAdminClick}>
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
                <Button variant="limited-time" size="sm" onClick={() => navigate("/auth")}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            {/* Mobile Search */}
            <div className="mb-4">
              <SearchBar />
            </div>
            
            <nav className="flex flex-col space-y-2">
              <Link to="/deals" className="text-gray-600 hover:text-primary py-2 px-3 rounded-md transition-colors">
                All Deals
              </Link>
              <Link to="/categories" className="text-gray-600 hover:text-primary py-2 px-3 rounded-md transition-colors">
                Categories
              </Link>
              <Link to="/shops" className="text-gray-600 hover:text-primary py-2 px-3 rounded-md transition-colors">
                Shops
              </Link>
              <Link to="/blog" className="text-gray-600 hover:text-primary py-2 px-3 rounded-md transition-colors">
                Blog
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-primary py-2 px-3 rounded-md transition-colors">
                Contact
              </Link>
              
              {user ? (
                <>
                  <Link to="/profile" className="text-gray-600 hover:text-primary py-2 px-3 rounded-md transition-colors">
                    Profile
                  </Link>
                  <Link to="/post-deal" className="text-gray-600 hover:text-primary py-2 px-3 rounded-md transition-colors">
                    Post Deal
                  </Link>
                  {(profile?.role === 'admin' || profile?.role === 'root_admin' || profile?.role === 'moderator') && (
                    <button onClick={handleAdminClick} className="text-left text-gray-600 hover:text-primary py-2 px-3 rounded-md transition-colors">
                      Admin Panel
                    </button>
                  )}
                  <button onClick={handleLogout} className="text-left text-gray-600 hover:text-primary py-2 px-3 rounded-md transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="text-gray-600 hover:text-primary py-2 px-3 rounded-md transition-colors">
                    Login
                  </Link>
                  <Link to="/auth" className="text-gray-600 hover:text-primary py-2 px-3 rounded-md transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
