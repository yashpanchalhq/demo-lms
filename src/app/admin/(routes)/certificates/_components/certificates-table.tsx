
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Download, RefreshCcw, XCircle, Mail } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

export type Certificate = {
  id: string;
  teacherName: string;
  teacherEmail: string;
  courseTitle: string;
  issuedAt: string;
  fileUrl: string;
  status: "ACTIVE" | "REVOKED";
};

const columns: ColumnDef<Certificate>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Certificate ID",
  },
  {
    accessorKey: "teacherName",
    header: "Teacher Name",
  },
  {
    accessorKey: "teacherEmail",
    header: "Email",
  },
  {
    accessorKey: "courseTitle",
    header: "Course Title",
  },
  {
    accessorKey: "issuedAt",
    header: "Issued At",
    cell: ({ row }) => new Date(row.original.issuedAt).toLocaleString(),
  },
  {
    accessorKey: "fileUrl",
    header: "File",
    cell: ({ row }) => (
      row.original.fileUrl ? (
        <a href={row.original.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          Download
        </a>
      ) : (
        "N/A"
      )
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const certificate = row.original;

      const handleDownload = () => {
        if (certificate.fileUrl) {
          window.open(certificate.fileUrl, '_blank');
        } else {
          toast.error("No file URL available.");
        }
      };

      const handleReissue = () => {
        toast.info("Reissue functionality not implemented.");
      };

      const handleRevoke = () => {
        toast.info("Revoke functionality not implemented.");
      };

      const handleResend = () => {
        toast.info("Resend email functionality not implemented.");
      };

      const handleViewAudit = () => {
        toast.info("View audit functionality not implemented.");
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReissue}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Reissue
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRevoke}>
              <XCircle className="mr-2 h-4 w-4" /> Revoke
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleResend}>
              <Mail className="mr-2 h-4 w-4" /> Resend email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewAudit}>
              View audit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function CertificatesTable<TData, TValue>({
  data,
}: ReportsTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
