"use client";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";

export function ReactionButtons() {
  return (
    <div className="flex flex-row space-x-2 ml-auto">
      <Button variant="outline" size="sm" className="px-1">
        <ThumbsUp className="h-4 w-4 mr-2" />
        <p className="text-sm text-muted-foreground">
          <span className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>J
          </span>
        </p>
      </Button>
      <Button variant="outline" size="sm" className="px-1">
        <ThumbsDown className="h-4 w-4 mr-2" />
        <p className="text-sm text-muted-foreground">
          <span className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </span>
        </p>
      </Button>
    </div>
  );
}
