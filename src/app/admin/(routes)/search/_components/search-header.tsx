
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SearchHeaderProps {
  onToggleFilterPanel: () => void;
}

export const SearchHeader = ({ onToggleFilterPanel }: SearchHeaderProps) => {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["All"]);
  const [scope, setScope] = useState("Title-only");

  const handleTypeToggle = (value: string[]) => {
    setSelectedTypes(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="relative flex-grow max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search across all content..."
            className="w-full pl-10 text-lg py-6 rounded-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon" className="ml-4 rounded-full" onClick={onToggleFilterPanel}>
          <SlidersHorizontal className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <ToggleGroup type="multiple" value={selectedTypes} onValueChange={handleTypeToggle} className="flex-wrap justify-center gap-2">
          <ToggleGroupItem value="All" className="px-4 py-2">All</ToggleGroupItem>
          <ToggleGroupItem value="Teachers" className="px-4 py-2">Teachers</ToggleGroupItem>
          <ToggleGroupItem value="Courses" className="px-4 py-2">Courses</ToggleGroupItem>
          <ToggleGroupItem value="Modules" className="px-4 py-2">Modules</ToggleGroupItem>
          <ToggleGroupItem value="Certificates" className="px-4 py-2">Certificates</ToggleGroupItem>
          <ToggleGroupItem value="Tickets" className="px-4 py-2">Tickets</ToggleGroupItem>
        </ToggleGroup>

        <div className="flex items-center gap-2">
          <Label htmlFor="scope-toggle">Full-text</Label>
          <Switch id="scope-toggle" checked={scope === "Full-text"} onCheckedChange={(checked) => setScope(checked ? "Full-text" : "Title-only")} />
          <Label htmlFor="scope-toggle">Title-only</Label>
        </div>
      </div>
    </div>
  );
};
