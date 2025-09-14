
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

interface SearchResultsProps {
  data: {
    teachers: any[];
    courses: any[];
    modules: any[];
    certificates: any[];
    tickets: any[];
  };
}

export const SearchResults = ({ data }: SearchResultsProps) => {
  const renderResultsGroup = (title: string, results: any[]) => {
    if (results.length === 0) return null;

    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title} ({results.length})</h3>
        <div className="space-y-2">
          {results.slice(0, 3).map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <h4 className="font-semibold">{item.title || item.name || item.id}</h4>
                <p className="text-sm text-muted-foreground">{item.snippet}</p>
                {/* Meta fields and quick actions */}
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm">Open</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {results.length > 3 && (
          <Button variant="link" className="px-0">View all {title.toLowerCase()} results</Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderResultsGroup("Teachers", data.teachers)}
      {renderResultsGroup("Courses", data.courses)}
      {renderResultsGroup("Modules", data.modules)}
      {renderResultsGroup("Certificates", data.certificates)}
      {renderResultsGroup("Tickets", data.tickets)}
    </div>
  );
};
