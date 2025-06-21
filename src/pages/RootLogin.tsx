
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Shield, Mail } from 'lucide-react';

const RootLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      // Check if user is root admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'root_admin') {
        await supabase.auth.signOut();
        toast.error('Access denied. Root admin privileges required.');
        setIsLoading(false);
        return;
      }

      toast.success('Welcome back, Administrator!');
      navigate('/root/dashboard');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-500/10 rounded-full w-fit">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {showForgotPassword ? 'Reset Password' : 'Root Admin Access'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {showForgotPassword 
                ? 'Enter your admin email to receive a password reset link'
                : 'Restricted access for system administrators only'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={showForgotPassword ? handleForgotPassword : handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-300">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your admin email"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {!showForgotPassword && (
                <div>
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                {isLoading ? 'Please wait...' : (
                  <>
                    {showForgotPassword ? <Mail className="h-4 w-4 mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                    {showForgotPassword ? 'Send Reset Email' : 'Access Admin Panel'}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                className="text-sm text-gray-400 hover:text-white"
              >
                {showForgotPassword ? 'Back to login' : 'Forgot your password?'}
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center">
                This is a restricted area. Unauthorized access attempts are logged and monitored.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RootLogin;
