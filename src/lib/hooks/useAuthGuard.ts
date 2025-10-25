import { useEffect } from 'react';

export function useAuthGuard() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check-session');
        const data = await response.json();
        
        if (!data.authenticated) {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Failed to check authentication status:', error);
        window.location.href = '/';
      }
    };

    // Check auth on mount
    checkAuth();

    // Poll for auth status every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
}