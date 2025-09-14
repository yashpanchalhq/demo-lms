"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface TeacherFooterProps {
  currentPage: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}

export const TeacherFooter = ({
  currentPage,
  perPage,
  totalCount,
  totalPages,
}: TeacherFooterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", newPage.toString());
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
      <div className="flex gap-2">
        <Button variant="outline">Import Teachers (CSV)</Button>
        <Button variant="outline">Export All to CSV</Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} ({totalCount} teachers)
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};