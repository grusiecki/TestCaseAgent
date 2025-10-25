import { Button } from "../ui/button";
import { Plus } from "lucide-react";

export function NewProjectButton() {
  return (
    <Button onClick={() => (window.location.href = "/new")} size="default" className="font-medium">
      <Plus className="mr-2 h-4 w-4" />
      New Project
    </Button>
  );
}
