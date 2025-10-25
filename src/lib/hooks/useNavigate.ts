import { useCallback } from 'react';

export const useNavigate = () => {
  return useCallback((path: string, options?: { replace?: boolean }) => {
    const url = new URL(path, window.location.origin);
    
    if (options?.replace) {
      window.location.replace(url.toString());
    } else {
      window.location.href = url.toString();
    }
  }, []);
};
