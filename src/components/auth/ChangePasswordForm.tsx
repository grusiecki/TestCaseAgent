import { useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AuthFeedback } from './AuthFeedback';

interface ChangePasswordFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ChangePasswordFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

type FormMode = 'request' | 'reset';

export function ChangePasswordForm() {
  const [mode, setMode] = useState<FormMode>('request');
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<ChangePasswordFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if we're in reset mode (token present in URL)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      setMode('reset');
    }
  }, []);

  const validateEmailForm = useCallback((): boolean => {
    const newErrors: ChangePasswordFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email]);

  const validatePasswordForm = useCallback((): boolean => {
    const newErrors: ChangePasswordFormErrors = {};

    if (!formData.password) {
      newErrors.password = 'New password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.password, formData.confirmPassword]);

  const handleInputChange = useCallback((field: keyof ChangePasswordFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmailForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      setSuccessMessage(null);

      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccessMessage('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'An error occurred while sending reset email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      setSuccessMessage(null);

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccessMessage('Password reset successfully! You can now sign in with your new password.');

      // Redirect to login after a delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'An error occurred while resetting password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/login';
  };

  if (mode === 'request') {
    return (
      <form onSubmit={handleRequestReset} className="space-y-6">
        <AuthFeedback
          error={errors.general}
          success={successMessage}
          loading={isLoading}
          loadingMessage="Sending reset email..."
        />

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleInputChange('email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={errors.email ? 'border-destructive focus-visible:ring-destructive/20' : ''}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Email'}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleBackToLogin}
              className="text-sm"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </form>
    );
  }

  // Reset password mode
  return (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <AuthFeedback
        error={errors.general}
        success={successMessage}
        loading={isLoading}
        loadingMessage="Resetting password..."
      />

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={handleInputChange('password')}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          className={errors.password ? 'border-destructive focus-visible:ring-destructive/20' : ''}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive/20' : ''}
        />
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="text-sm text-destructive">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={handleBackToLogin}
            className="text-sm"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    </form>
  );
}
