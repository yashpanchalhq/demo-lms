
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export const ContactChannelsSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Channels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          <strong>Support Email:</strong> support@example.com
        </p>
        <p className="text-sm">
          <strong>Phone:</strong> +1 (800) 123-4567
        </p>
        <p className="text-xs text-muted-foreground">
          Office hours: Monday - Friday, 9 AM - 5 PM (Your Timezone)
        </p>
      </CardContent>
    </Card>
  );
};
