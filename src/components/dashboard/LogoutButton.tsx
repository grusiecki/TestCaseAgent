import { useState } from "react";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="default"
      disabled={isLoading}
      className="font-medium"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
