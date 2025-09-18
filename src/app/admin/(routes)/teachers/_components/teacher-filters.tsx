"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const TeacherFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q");
  const currentRoles = searchParams.getAll("role");

  const [qValue, setQValue] = useState(currentQ || "");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);

  const debouncedQValue = useDebounce(qValue, 500);

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    debouncedQValue ? current.set("q", debouncedQValue) : current.delete("q");

    current.delete("role");
    selectedRoles.forEach((role) => current.append("role", role));

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  }, [debouncedQValue, selectedRoles, router, pathname, searchParams]);

  const handleRoleChange = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Filter by Role</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={selectedRoles.includes("TEACHER")}
            onCheckedChange={() => handleRoleChange("TEACHER")}
          >
            Teacher
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedRoles.includes("ADMIN")}
            onCheckedChange={() => handleRoleChange("ADMIN")}
          >
            Admin
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};