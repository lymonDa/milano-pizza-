import { useState, useEffect, type ReactNode } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface AdminAuthGuardProps {
  children: ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkLoading, setCheckLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCheckLoading(false);
      setIsAdmin(false);
      return;
    }

    let cancelled = false;

    const checkRole = async () => {
      try {
        const { data, error } = await supabase.rpc('check_admin_access');

        if (!cancelled) {
          if (error) throw error;
          setIsAdmin(data === true);
        }
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setCheckLoading(false);
      }
    };

    checkRole();
    return () => { cancelled = true; };
  }, [user]);

  if (authLoading || checkLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-50">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-50">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-50 flex items-center justify-center">
            <i className="ri-shield-user-line text-accent-500 text-2xl" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground-950 mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-foreground-500 mb-6">
            You do not have permission to access the admin area.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-primary-500 text-background-50 rounded-md hover:bg-primary-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}