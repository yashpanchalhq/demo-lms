"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

export const TeacherFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q");

  const [qValue, setQValue] = useState(currentQ || "");

  const debouncedQValue = useDebounce(qValue, 500);

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    debouncedQValue ? current.set("q", debouncedQValue) : current.delete("q");

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  }, [debouncedQValue, router, pathname, searchParams]);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teachers by name or email..."
          className="w-full pl-9"
          value={qValue}
          onChange={(e) => setQValue(e.target.value)}
        />
      </div>

      {/* Placeholder for Filter by Role */}
      <Button variant="outline">Filter by Role</Button>
    </div>
  );
};