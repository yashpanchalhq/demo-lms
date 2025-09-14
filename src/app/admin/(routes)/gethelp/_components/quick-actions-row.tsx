
import { Button } from "@/components/ui/button";
import React from "react";

export const QuickActionsRow = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline">Troubleshoot wizard</Button>
      <Button>Create ticket</Button>
      <Button variant="outline">Upload logs</Button>
      <Button variant="outline">Request DB export</Button>
      <Button variant="outline">Request remote session</Button>
    </div>
  );
};
