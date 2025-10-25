import { useCallback } from 'react';

export const useNavigate = () => {
  return useCallback((path: string, options?: { replace?: boolean }) => {
    const url = new URL(path, window.location.origin);
    
    // Check if Astro's View Transitions API is available
    if ('navigate' in window && typeof window.navigate === 'function') {
      window.navigate(url.toString(), {
        history: options?.replace ? 'replace' : 'push'
      });
    } else {
      // Fallback to traditional navigation
      if (options?.replace) {
        window.location.replace(url.toString());
      } else {
        window.location.href = url.toString();
      }
    }
  }, []);
};
