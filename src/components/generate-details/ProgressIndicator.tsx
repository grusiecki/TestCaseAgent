interface ProgressIndicatorProps {
  currentIndex: number;
  total: number;
  isLoading: boolean;
}

export function ProgressIndicator({ currentIndex, total, isLoading }: ProgressIndicatorProps) {
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">
          {isLoading ? (
            'Generating test case details...'
          ) : (
            `Test Case ${currentIndex + 1} of ${total}`
          )}
        </span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isLoading ? 'bg-blue-600 animate-pulse' : 'bg-green-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
