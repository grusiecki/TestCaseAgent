import { useState } from "react";
import type { ProjectDTO } from "@/types";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Loader2, Download, Trash2, Calendar, FileText, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectDTO;
  onExport: (projectId: string) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  onSelect: (projectId: string) => void;
}

export function ProjectCard({ project, onExport, onDelete, onSelect }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(project.id);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExporting) {
      setIsExporting(true);
      try {
        await onExport(project.id);
      } finally {
        setIsExporting(false);
      }
    }
  };

  const formattedDate = new Date(project.created_at).toLocaleDateString();

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "hover:shadow-lg dark:hover:shadow-primary/10",
          "hover:scale-[1.02] active:scale-[0.98]",
          "cursor-pointer"
        )}
        onClick={() => onSelect(project.id)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader>
          <CardTitle className="line-clamp-1">{project.name}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formattedDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Test Cases
              </div>
              <p className="text-2xl font-bold">{project.testCaseCount}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                Rating
              </div>
              <p
                className={cn(
                  "text-2xl font-bold",
                  project.rating && project.rating >= 4 ? "text-green-600 dark:text-green-400" : ""
                )}
              >
                {project.rating ?? "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="relative group/button"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 transition-transform group-hover/button:-translate-y-0.5" />
            )}
            <span className="ml-2">Export</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            disabled={isDeleting}
            className="relative group/button"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 transition-transform group-hover/button:scale-110" />
            )}
            <span className="ml-2">Delete</span>
          </Button>
        </CardFooter>
      </Card>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Project
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{project.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="relative group">
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
              )}
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
