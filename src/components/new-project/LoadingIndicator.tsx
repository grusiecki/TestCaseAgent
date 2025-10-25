import { Loader2 } from 'lucide-react';

export const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">
        Generating test case titles...
      </p>
    </div>
  );
};
