import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { FileText, Box } from "lucide-react";
import type { DashboardStatsViewModel } from "./types";

interface DashboardStatsProps {
  stats: DashboardStatsViewModel;
  isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  const StatCard = ({
    title,
    value,
    icon: Icon,
  }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
  }) => (
    <Card className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-primary/10">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-full dark:bg-primary/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold tracking-tight">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StatCard title="Total Projects" value={stats.totalProjects} icon={Box} />
      <StatCard title="Total Test Cases" value={stats.totalTestCases} icon={FileText} />
    </div>
  );
}