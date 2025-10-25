import { Alert } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

interface TitlesValidatorProps {
  errorMessage: string | null;
  titlesCount: number;
}

export const TitlesValidator = ({ errorMessage, titlesCount }: TitlesValidatorProps) => {
  const getValidationMessage = () => {
    if (errorMessage) {
      return errorMessage;
    }
    
    if (titlesCount === 0) {
      return 'No test case titles available';
    }
    
    if (titlesCount === 20) {
      return 'Maximum number of titles reached (20)';
    }
    
    return `${titlesCount} test case title${titlesCount !== 1 ? 's' : ''} available`;
  };

  const isError = !!errorMessage || titlesCount === 0;

  return (
    <Alert 
      variant={isError ? "destructive" : "default"}
      className="mb-4"
    >
      {isError ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <Info className="h-4 w-4" />
      )}
      <span className="ml-2">{getValidationMessage()}</span>
    </Alert>
  );
};
