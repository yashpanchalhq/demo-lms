"use client";

// import { redirect } from "next/navigation"; // Remove this import
// import { currentUser } from "@clerk/nextjs/server"; // Remove this import
import React, { useState } from "react";
import { SearchHeader } from "./_components/search-header";
import { FilterPanel } from "./_components/filter-panel";
import { ResultsSummary } from "./_components/results-summary";
import { SearchResults } from "./_components/search-results";

interface SearchPageClientProps {
  userId: string; // Accept userId as prop
}

const SearchPageClient = ({ userId }: SearchPageClientProps) => {
  // const user = await currentUser(); // Remove this
  // const userId = user?.id; // Remove this

  // if (!userId) { // Remove this block
  //   return redirect("/");
  // }

  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const handleToggleFilterPanel = () => {
    setShowFilterPanel((prev) => !prev);
  };

  // Mock Data for now
  const searchResults = {
    teachers: [
      {
        id: "t1",
        name: "John Doe",
        email: "john.doe@example.com",
        role: "Teacher",
        snippet: "...teaches math...",
      },
    ],
    courses: [
      {
        id: "c1",
        title: "Algebra I",
        description: "...basic algebra...",
        snippet: "...course on algebra...",
      },
    ],
    modules: [
      {
        id: "m1",
        title: "Module 1",
        type: "video",
        snippet: "...video on fractions...",
      },
    ],
    certificates: [
      {
        id: "cert1",
        teacherName: "John Doe",
        courseTitle: "Algebra I",
        snippet: "...certificate for algebra...",
      },
    ],
    tickets: [
      {
        id: "tkt1",
        title: "Login Issue",
        status: "open",
        snippet: "...user cannot log in...",
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <SearchHeader onToggleFilterPanel={handleToggleFilterPanel} />
      {showFilterPanel && <FilterPanel />}
      <ResultsSummary
        totalResults={Object.values(searchResults).flat().length}
        teachersCount={searchResults.teachers.length}
        coursesCount={searchResults.courses.length}
        modulesCount={searchResults.modules.length}
        certificatesCount={searchResults.certificates.length}
        ticketsCount={searchResults.tickets.length}
        timeTaken={120} // Mock ms
      />
      <SearchResults data={searchResults} />
    </div>
  );
};

export default SearchPageClient;