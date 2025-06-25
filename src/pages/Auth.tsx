import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Flame, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  if (user) {
    navigate('/profile', { replace: true });
    return null;
  }

  const validateUsername = async (value: string) => {
    setUsernameError('');
    
    if (!value) {
      setUsernameError('Username is required');
      return false;
    }
    
    if (value.includes(' ')) {
      setUsernameError('Username cannot contain spaces');
      return false;
    }
    
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return false;
    }
    
    setIsCheckingUsername(true);
    try {
      const { data, error } = await supabase.rpc('check_username_exists', {
        username_to_check: value
      });
      
      if (error) {
        console.error('Error checking username:', error);
        return true; // Allow submission if check fails
      }
      
      if (data) {
        setUsernameError('Username is already taken');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking username:', error);
      return true; // Allow submission if check fails
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value) {
      await validateUsername(value);
    } else {
      setUsernameError('');
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
      navigate('/profile', { replace: true });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const username = formData.get('username') as string;

    try {
      // Validate username one more time before submission
      const isUsernameValid = await validateUsername(username);
      if (!isUsernameValid) {
        setIsLoading(false);
        return;
      }

      const { error } = await signUp(email, password, {
        full_name: fullName,
        username: username,
      });

      if (error) {
        if (error.message.includes('Username cannot contain spaces')) {
          setUsernameError('Username cannot contain spaces');
        } else if (error.message.includes('Username already exists')) {
          setUsernameError('Username is already taken');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created! Please check your email to verify your account.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            <span className="text-gray-600">Back to Spark.deals</span>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Flame className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome to Spark.deals</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Input
                      name="fullName"
                      type="text"
                      placeholder="Full Name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Input
                      name="username"
                      type="text"
                      placeholder="Username"
                      required
                      disabled={isLoading}
                      onChange={handleUsernameChange}
                      className={usernameError ? 'border-red-500' : ''}
                    />
                    {isCheckingUsername && (
                      <p className="text-xs text-gray-500 mt-1">Checking availability...</p>
                    )}
                    {usernameError && (
                      <p className="text-xs text-red-500 mt-1">{usernameError}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !!usernameError || isCheckingUsername}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
