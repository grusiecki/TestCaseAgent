import type { GenerateTitlesCommand } from '@/types';
import { DocumentationTextarea } from '@/components/new-project/DocumentationTextarea';
import { ProjectNameInput } from '@/components/new-project/ProjectNameInput';
import { GenerateTitlesButton } from '@/components/new-project/GenerateTitlesButton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { newProjectLogger } from '@/lib/logging/new-project.logger';

interface NewProjectFormProps {
  documentation: string;
  projectName?: string;
  charCount: number;
  isLoading: boolean;
  onSubmit: (data: GenerateTitlesCommand) => Promise<void>;
  onChange: (values: { documentation?: string; projectName?: string; charCount?: number }) => void;
}

export const NewProjectForm = ({
  documentation,
  projectName,
  charCount,
  isLoading,
  onSubmit,
  onChange,
}: NewProjectFormProps) => {
  const isValid = charCount >= 100 && charCount <= 5000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      newProjectLogger.formInteraction('submit-invalid', {
        charCount,
        isValid,
        hasProjectName: !!projectName
      });
      return;
    }

    newProjectLogger.formInteraction('submit-valid', {
      charCount,
      isValid,
      hasProjectName: !!projectName
    });

    try {
      await onSubmit({
        documentation: documentation.trim(),
        projectName: projectName?.trim(),
      });
    } catch (error) {
      newProjectLogger.formInteraction('submit-error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        charCount,
        hasProjectName: !!projectName
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <ProjectNameInput
            value={projectName}
            onChange={(value: string) => {
              newProjectLogger.formInteraction('project-name-change', {
                hasValue: !!value,
                length: value.length
              });
              onChange({ projectName: value });
            }}
          />
          
          <DocumentationTextarea
            value={documentation}
            charCount={charCount}
            onChange={(value: string, count: number) => {
              newProjectLogger.formInteraction('documentation-change', {
                charCount: count,
                isValid: count >= 100 && count <= 5000
              });
              onChange({ documentation: value, charCount: count });
            }}
          />
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <GenerateTitlesButton 
            disabled={!isValid} 
            charCount={charCount}
            isLoading={isLoading}
          />
        </CardFooter>
      </Card>
    </form>
  );
};