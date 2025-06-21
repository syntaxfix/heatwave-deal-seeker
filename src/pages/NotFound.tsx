
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, Frown } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-0 shadow-2xl bg-white/70 backdrop-blur-sm">
            <CardContent className="p-12">
              {/* Large 404 Animation */}
              <div className="relative mb-8">
                <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text animate-pulse">
                  404
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Frown className="h-16 w-16 text-gray-400 animate-bounce" />
                </div>
              </div>

              {/* Error Message */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Oops! Page Not Found
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                  The page you're looking for seems to have vanished into thin air.
                </p>
                <p className="text-sm text-gray-500 bg-gray-100 rounded-lg p-3 font-mono">
                  Route: <span className="text-red-600">{location.pathname}</span>
                </p>
              </div>

              {/* Helpful Suggestions */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Here's what you can do:
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Search className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-medium">Search for deals</span>
                    </div>
                    <p>Try searching for what you were looking for</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center mb-2">
                      <Home className="h-4 w-4 text-green-600 mr-2" />
                      <span className="font-medium">Visit homepage</span>
                    </div>
                    <p>Start fresh from our homepage</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Homepage
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => window.history.back()}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>

              {/* Fun Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Lost? Don't worry, even the best deals hunters get lost sometimes! 🧭
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default NotFound;
