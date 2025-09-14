"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function SignUpCallback() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Ensure user object is loaded before checking metadata
    if (isLoaded && user) {
      if (user.publicMetadata?.role === "admin") {
        router.replace("/admin");
      } else {
        // Default redirect for non-admin users
        router.replace("/teacher");
      }
    }
  }, [user, isLoaded, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="text-gray-500">Please wait while we redirect you...</p>
      </div>
    </div>
  );
}
