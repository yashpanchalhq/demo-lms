
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import React from "react";

interface FaqKbSectionProps {
  faqs: { question: string; answer: string }[];
}

export const FaqKbSection = ({ faqs }: FaqKbSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Searchable FAQ / Knowledge Base</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search FAQs..." className="w-full pl-9" />
        </div>
        <div className="space-y-2">
          {faqs.slice(0, 6).map((faq, index) => (
            <div key={index}>
              <h4 className="font-medium">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
        <Link href="#" className="text-blue-600 hover:underline text-sm">
          View all docs (external KB) →
        </Link>
      </CardContent>
    </Card>
  );
};
