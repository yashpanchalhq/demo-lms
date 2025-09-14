"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from "react";

interface AdminsUserManagementCardProps {
  initialData: {
    currentAdmins: { id: string; name: string; email: string; role: string }[];
  };
}

export const AdminsUserManagementCard = ({ initialData }: AdminsUserManagementCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admins & User Management</CardTitle>
        <CardDescription>Manage administrative users and invite new ones.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium mb-2">Current Admins</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.currentAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Button>Invite New Admin</Button>
      </CardContent>
    </Card>
  );
};