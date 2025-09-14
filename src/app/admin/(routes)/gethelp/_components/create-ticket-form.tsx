
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const CreateTicketForm = () => {
  const [severity, setSeverity] = useState("Low");
  const [category, setCategory] = useState("Bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]); // Assuming file upload returns URLs
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const ticketData = {
        severity,
        category,
        title,
        description,
        attachments,
      };
      await axios.post("/api/admin/tickets", ticketData);
      toast.success("Ticket created successfully!");
      // Clear form
      setSeverity("Low");
      setCategory("Bug");
      setTitle("");
      setDescription("");
      setAttachments([]);
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityOptions = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Critical", value: "Critical" },
  ];

  const categoryOptions = [
    { label: "Bug", value: "Bug" },
    { label: "Feature", value: "Feature" },
    { label: "Account", value: "Account" },
    { label: "Other", value: "Other" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Ticket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="severity">Severity</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              {severityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {/* Attachments will be handled by FileUploadSection */}
        <Button onClick={handleSubmit} disabled={isSubmitting || !title}>
          {isSubmitting ? "Submitting..." : "Submit Ticket"}
        </Button>
      </CardContent>
    </Card>
  );
};
