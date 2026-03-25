import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, FileText, Search } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { DocumentType, type Employee } from "../backend.d";
import { useGetDocuments, useGetEmployees } from "../hooks/useQueries";

const DOC_LABELS: Record<DocumentType, string> = {
  [DocumentType.passportPhoto]: "Passport Size Photo",
  [DocumentType.aadharCard]: "Aadhar Card",
  [DocumentType.panCard]: "PAN Card",
  [DocumentType.class10Marksheet]: "Class 10th Marksheet",
  [DocumentType.class12Marksheet]: "Class 12th Marksheet",
  [DocumentType.diplomaCertificate]: "Diploma Certificate",
  [DocumentType.bachelorsDegree]: "Bachelor's Degree",
  [DocumentType.mastersDegree]: "Master's Degree",
  [DocumentType.bankStatement]: "Bank Statement / Cancelled Cheque",
  [DocumentType.experienceCertificate]: "Past Experience Certificate",
};

function formatDate(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFileSize(bytes: bigint): string {
  const b = Number(bytes);
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function EmployeeDocsRow({ employee }: { employee: Employee }) {
  const { data: docs = [] } = useGetDocuments(employee.employeeId);
  return (
    <>
      {docs.map((doc, idx) => (
        <TableRow
          key={`${employee.employeeId}-${doc.documentType}`}
          className="hover:bg-muted/20"
          data-ocid={`documents.item.${idx + 1}`}
        >
          <TableCell className="pl-6">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {DOC_LABELS[doc.documentType]}
              </span>
            </div>
          </TableCell>
          <TableCell>
            <span className="text-sm">{employee.name}</span>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className="text-xs">
              {employee.department}
            </Badge>
          </TableCell>
          <TableCell>
            <span className="text-sm text-muted-foreground">
              {doc.fileName}
            </span>
          </TableCell>
          <TableCell>
            <span className="text-sm text-muted-foreground">
              {formatFileSize(doc.fileSize)}
            </span>
          </TableCell>
          <TableCell>
            <span className="text-sm text-muted-foreground">
              {formatDate(doc.uploadedAt)}
            </span>
          </TableCell>
          <TableCell className="pr-6 text-right">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={() => window.open(doc.blobId.getDirectURL(), "_blank")}
              data-ocid={`documents.view_button.${idx + 1}`}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function DocumentsPage() {
  const [search, setSearch] = useState("");
  const { data: employees = [], isLoading } = useGetEmployees();
  const navigate = useNavigate();

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground">All Documents</h1>
        <p className="text-muted-foreground mt-0.5">
          View all uploaded documents across all employees.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <Card className="shadow-card border-border">
          <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
            <CardTitle className="text-base font-semibold">
              Document Repository
            </CardTitle>
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
                data-ocid="documents.search_input"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div
                className="p-6 space-y-3"
                data-ocid="documents.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                data-ocid="documents.empty_state"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold">No documents found</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Add employees and upload documents to see them here.
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate({ to: "/" })}
                  data-ocid="documents.empty.go_dashboard.button"
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="pl-6">Document Type</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead className="pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((emp) => (
                      <EmployeeDocsRow key={emp.employeeId} employee={emp} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
