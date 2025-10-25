import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage = ({ message, className }: ErrorMessageProps) => {
  return (
    <div className={cn(
      "flex items-center gap-2 p-4 text-sm border rounded-md bg-destructive/10 text-destructive border-destructive/20",
      className
    )}>
      <AlertCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};
