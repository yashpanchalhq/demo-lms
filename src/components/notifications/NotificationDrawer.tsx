"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { IconBell } from "@tabler/icons-react";

export default function NotificationDrawer() {
  return (
    <Button variant="ghost" size="icon">
      <IconBell />
      <span className="sr-only">Notifications</span>
    </Button>
  );
}
