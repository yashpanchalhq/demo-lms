"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ModuleItem = {
  id: string;
  title: string;
  courseTitle: string;
};

type InProgressListProps = {
  initialItems: ModuleItem[];
  total: number;
  userId: string;
};

const InProgressList = ({ initialItems, total, userId }: InProgressListProps) => {
  // For now, just display the initial items
  // In a real implementation, this would have state, filters, and mutation logic

  if (initialItems.length === 0) {
    return <p>You have no modules in progress.</p>;
  }

  return (
    <div className="space-y-4">
      {initialItems.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="text-lg">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              From course: {item.courseTitle}
            </p>
            <Button>
              Mark as Complete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InProgressList;
