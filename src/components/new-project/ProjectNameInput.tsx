import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { newProjectLogger } from '@/lib/logging/new-project.logger';

interface ProjectNameInputProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ProjectNameInput = ({
  value = '',
  onChange,
  className,
}: ProjectNameInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value || '';
    newProjectLogger.formInteraction('project-name-input', {
      value: newValue,
      length: newValue.length
    });
    onChange(newValue);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor="projectName" 
        className="text-sm font-medium"
      >
        Project Name (optional)
      </Label>
      <Input
        type="text"
        id="projectName"
        name="projectName"
        value={value}
        onChange={handleChange}
        placeholder="Enter project name"
        className="w-full"
        autoComplete="off"
      />
      <p className="text-xs text-muted-foreground">
        Leave empty to generate test cases without a project
      </p>
    </div>
  );
};