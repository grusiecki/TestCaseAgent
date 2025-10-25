import { useState } from 'react';
import { DocumentationTextarea } from './DocumentationTextarea';
import { GenerateTitlesButton } from './GenerateTitlesButton';
import { TitlesService } from '@/lib/services/titles.service';
import { newProjectLogger } from '@/lib/logging/new-project.logger';
import { ErrorMessage } from './ErrorMessage';

interface GenerateTitlesFormProps {
  projectName?: string;
  onTitlesGenerated: (titles: string[]) => void;
}

export const GenerateTitlesForm = ({
  projectName,
  onTitlesGenerated
}: GenerateTitlesFormProps) => {
  const [documentation, setDocumentation] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentationChange = (value: string, count: number) => {
    setDocumentation(value);
    setCharCount(count);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await TitlesService.generateTitles({
        documentation,
        projectName
      });

      newProjectLogger.success('titles-generated', {
        titlesCount: result.titles.length,
        projectName
      });

      onTitlesGenerated(result.titles);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate titles';
      setError(message);
      
      newProjectLogger.error('titles-generation-failed', {
        error,
        projectName
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = charCount >= 100 && charCount <= 5000;

  return (
    <div className="space-y-6">
      <DocumentationTextarea
        value={documentation}
        charCount={charCount}
        onChange={handleDocumentationChange}
      />

      {error && <ErrorMessage message={error} />}

      <div className="flex justify-end">
        <GenerateTitlesButton
          disabled={!isValid}
          charCount={charCount}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
