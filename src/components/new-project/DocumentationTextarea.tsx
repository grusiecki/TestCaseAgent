import { useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { newProjectLogger } from '@/lib/logging/new-project.logger';

interface DocumentationTextareaProps {
  value: string;
  charCount: number;
  onChange: (value: string, charCount: number) => void;
}

export const DocumentationTextarea = ({
  value,
  charCount,
  onChange,
}: DocumentationTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value || '';
    const newCharCount = newValue.length;
    
    newProjectLogger.formInteraction('documentation-input', {
      length: newCharCount,
      isValid: newCharCount >= 100 && newCharCount <= 5000
    });
    
    onChange(newValue, newCharCount);
  };

  const getValidationStatus = () => {
    if (charCount === 0) return 'default';
    
    if (charCount < 100) {
      newProjectLogger.validationError('documentation', charCount, 'Documentation too short');
      return 'error';
    }
    
    if (charCount > 5000) {
      newProjectLogger.validationError('documentation', charCount, 'Documentation too long');
      return 'error';
    }
    
    return 'success';
  };

  const status = getValidationStatus();

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="documentation" className="text-sm font-medium">
          Documentation
        </Label>
        <span 
          className={cn(
            "text-xs",
            status === 'error' && "text-destructive",
            status === 'success' && "text-muted-foreground"
          )}
        >
          {charCount} / 5000 characters
          {charCount < 100 && " (minimum 100)"}
        </span>
      </div>

      <textarea
        ref={textareaRef}
        id="documentation"
        name="documentation"
        value={value}
        onChange={handleChange}
        className={cn(
          "flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          status === 'error' && "border-destructive focus-visible:ring-destructive"
        )}
        placeholder="Paste your documentation here (100-5000 characters)"
      />

      {status === 'error' && charCount > 0 && (
        <p className="text-xs text-destructive">
          {charCount < 100 
            ? "Documentation must be at least 100 characters long"
            : "Documentation cannot exceed 5000 characters"}
        </p>
      )}
    </div>
  );
};