import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface NavigationButtonsProps {
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => Promise<void>;
  isLastItem: boolean;
  disabled?: {
    previous?: boolean;
    next?: boolean;
  };
}

export function NavigationButtons({
  currentIndex,
  total,
  onPrevious,
  onNext,
  onFinish,
  isLastItem,
  disabled = {}
}: NavigationButtonsProps) {
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not in a text input/textarea
      if (e.target instanceof HTMLElement && 
          (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && !isLastItem) {
        onNext();
      } else if (e.key === 'Enter' && isLastItem) {
        onFinish();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isLastItem, onPrevious, onNext, onFinish]);

  const [isFinishing, setIsFinishing] = useState(false);

  const handleFinishClick = async () => {
    setIsFinishing(true);
    try {
      await onFinish();
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <nav 
      className="flex justify-between items-center mt-6"
      role="navigation"
      aria-label="Test case navigation"
    >
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={disabled?.previous}
        aria-label="Previous test case"
        title="Previous test case (Left Arrow)"
      >
        <span aria-hidden="true">←</span> Previous
      </Button>

      <div className="flex gap-3">
        {isLastItem ? (
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700 min-w-[140px]"
            onClick={handleFinishClick}
            disabled={isFinishing}
            aria-label="Finish and export test cases"
            title="Finish and export (Enter)"
          >
            {isFinishing ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Exporting...
              </>
            ) : (
              'Finish & Export'
            )}
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={onNext}
            disabled={disabled?.next}
            aria-label="Next test case"
            title="Next test case (Right Arrow)"
          >
            Next <span aria-hidden="true">→</span>
          </Button>
        )}
      </div>
    </nav>
  );
}
