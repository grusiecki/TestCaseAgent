import { useState } from 'react';
import { supabase } from '../../db/supabase.client';

export interface AuthError {
  message: string;
  status?: number;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        window.location.href = '/dashboard';
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to sign in',
        status: err.status,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Przekierowanie na stronę główną zamiast /login
      window.location.href = '/';
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to sign out',
        status: err.status,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signOut,
    isLoading,
    error,
  };
}