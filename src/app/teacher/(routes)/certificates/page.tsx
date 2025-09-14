"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Type based on API response
type Certificate = {
  id: string;
  createdAt: string;
  fileUrl: string | null;
  course: {
    id: string;
    title: string;
    imageUrl: string | null;
  };
};

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch("/api/teacher/certificates");
        if (!response.ok) {
          throw new Error("Failed to fetch certificates.");
        }
        const data = await response.json();
        setCertificates(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <div className="p-6">
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="flex items-center p-4">
              <Skeleton className="h-16 w-16 mr-4" />
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-10 w-24" />
            </Card>
          ))}
        </div>
      )}
      {error && <div className="text-red-500">Error: {error}</div>}
      {!isLoading && !error && certificates.length === 0 && (
        <p>You have not earned any certificates yet.</p>
      )}
      {!isLoading && !error && certificates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card
              key={cert.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center">
                {/* Placeholder for course image */}
                <div className="h-16 w-16 bg-gray-200 rounded-md mr-4 flex-shrink-0"></div>
                <div>
                  <CardTitle className="text-lg">{cert.course.title}</CardTitle>
                  <p className="text-sm text-gray-500">
                    Issued on: {new Date(cert.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                disabled={!cert.fileUrl}
                onClick={() => window.open(cert.fileUrl!, "_blank")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
