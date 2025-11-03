import { Card, CardContent } from '@/components/ui/card';
import type { ProjectDTO } from '@/types';

interface ProjectSummaryProps {
  project: ProjectDTO;
}

export function ProjectSummary({ project }: ProjectSummaryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingDisplay = (rating: number | null) => {
    if (rating === null) return 'Not rated';
    return `${rating}/10`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Project Name
            </h3>
            <p className="text-lg font-semibold text-gray-900">{project.name}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Created Date
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(project.created_at)}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Rating
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {getRatingDisplay(project.rating)}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Total Test Cases
              </h3>
              <p className="text-2xl font-bold text-gray-900">{project.testCaseCount}</p>
            </div>
            <div className="text-right space-y-1">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Status
              </h3>
              <p className="text-lg font-semibold text-green-600">Ready for Export</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
