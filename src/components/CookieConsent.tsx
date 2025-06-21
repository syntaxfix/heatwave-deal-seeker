
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, X } from 'lucide-react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDeny = () => {
    localStorage.setItem('cookie-consent', 'denied');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <Card className="max-w-md mx-auto shadow-lg border-2 border-deals-hot/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 bg-deals-hot/10 rounded-full">
              <Cookie className="w-5 h-5 text-deals-hot" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Hi! We are the cookies! 🍪
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies to enhance your browsing experience, analyze site traffic, 
                and personalize content. By clicking "Accept", you consent to our use of cookies.
              </p>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleAccept}
                  className="flex-1 bg-deals-hot hover:bg-deals-fire"
                >
                  Accept
                </Button>
                <Button 
                  onClick={handleDeny}
                  variant="outline"
                  className="flex-1"
                >
                  Deny
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;
