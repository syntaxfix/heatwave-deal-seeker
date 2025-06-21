
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'root_admin' | 'admin' | 'moderator';
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole = 'root_admin', 
  redirectTo = '/root/login' 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      if (!user) {
        toast.error('Authentication required');
        navigate(redirectTo);
        return;
      }

      if (requiredRole) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || !profile || profile.role !== requiredRole) {
          toast.error(`${requiredRole} access required`);
          navigate(redirectTo);
          return;
        }
      }
    };

    checkAccess();
  }, [user, loading, requiredRole, redirectTo, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
