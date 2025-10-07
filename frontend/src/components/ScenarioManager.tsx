import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Folder } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ScenarioRow } from "@/types/scenario";

interface ScenarioManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarios: ScenarioRow[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function ScenarioManager({
  open,
  onOpenChange,
  scenarios,
  onLoad,
  onDelete,
  isLoading,
}: ScenarioManagerProps) {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this scenario?")) {
      onDelete(id);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Saved Scenarios</SheetTitle>
          <SheetDescription>Load or delete your saved ROI scenarios</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : scenarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Folder className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No saved scenarios yet</p>
              <p className="text-sm text-muted-foreground">Save a scenario to see it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                  onClick={() => onLoad(scenario.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{scenario.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(scenario.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 hover:text-destructive"
                      onClick={(e) => handleDelete(e, scenario.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
