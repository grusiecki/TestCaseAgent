import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { newProjectLogger } from '@/lib/logging/new-project.logger';

interface AddTitleButtonProps {
  onAdd: () => void;
  disabled: boolean;
}

export const AddTitleButton = ({ onAdd, disabled }: AddTitleButtonProps) => {
  const handleClick = () => {
    try {
      newProjectLogger.formInteraction('add-title-button-click', {
        isDisabled: disabled
      });
      
      if (!disabled) {
        onAdd();
      }
    } catch (error) {
      newProjectLogger.error('add-title-button-error', { error });
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant="outline"
      className="w-full gap-2"
    >
      <Plus className="h-4 w-4" />
      Add New Test Case Title
    </Button>
  );
};
