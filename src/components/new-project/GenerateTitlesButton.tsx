import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { newProjectLogger } from '@/lib/logging/new-project.logger';

interface GenerateTitlesButtonProps {
  disabled: boolean;
  charCount: number;
  isLoading?: boolean;
}

export const GenerateTitlesButton = ({ 
  disabled, 
  charCount,
  isLoading = false 
}: GenerateTitlesButtonProps) => {
  const getButtonText = () => {
    if (isLoading) return 'Generating Titles...';
    if (charCount === 0) return 'Add documentation to generate titles';
    if (charCount < 100) return 'Documentation too short';
    if (charCount > 5000) return 'Documentation too long';
    return 'Generate Test Case Titles';
  };

  const handleClick = () => {
    newProjectLogger.formInteraction('generate-button-click', {
      charCount,
      isDisabled: disabled,
      buttonText: getButtonText()
    });
  };

  return (
    <Button 
      type="submit"
      disabled={disabled || isLoading}
      className="gap-2"
      onClick={handleClick}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="h-4 w-4" />
      )}
      {getButtonText()}
    </Button>
  );
};