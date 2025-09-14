
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import SearchPageClient from "./search-page-client"; // Import the client component

const SearchPage = async () => {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return redirect("/");
  }

  // You can fetch server-side data here and pass it to the client component
  // For now, we'll just pass the userId

  return <SearchPageClient userId={userId} />;
};

export default SearchPage;
