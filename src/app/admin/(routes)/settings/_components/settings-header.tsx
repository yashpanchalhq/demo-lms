import { Button } from "@/components/ui/button";
import React from "react";

interface SettingsHeaderProps {
  orgIdentifier: string;
}

export const SettingsHeader = ({ orgIdentifier }: SettingsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-medium">Settings</h1>
        <span className="text-sm text-muted-foreground">
          Portal for Teachers — {orgIdentifier}
        </span>
      </div>
      {/* Removed Save/Revert buttons for now */}
    </div>
  );
};