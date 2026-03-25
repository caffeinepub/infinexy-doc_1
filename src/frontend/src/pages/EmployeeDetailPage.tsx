import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  GraduationCap,
  Image,
  Landmark,
  Loader2,
  Mail,
  Phone,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { type Document, DocumentType } from "../backend.d";
import {
  useAddDocument,
  useDeleteDocument,
  useGetDocuments,
  useGetEmployee,
} from "../hooks/useQueries";

const TOTAL_DOC_TYPES = 10;

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

const DOC_ICONS: Record<DocumentType, React.ElementType> = {
  [DocumentType.passportPhoto]: Image,
  [DocumentType.aadharCard]: CreditCard,
  [DocumentType.panCard]: CreditCard,
  [DocumentType.class10Marksheet]: BookOpen,
  [DocumentType.class12Marksheet]: BookOpen,
  [DocumentType.diplomaCertificate]: Award,
  [DocumentType.bachelorsDegree]: GraduationCap,
  [DocumentType.mastersDegree]: GraduationCap,
  [DocumentType.bankStatement]: Landmark,
  [DocumentType.experienceCertificate]: Briefcase,
};

const ALL_DOC_TYPES = Object.values(DocumentType);

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:
      return "application/octet-stream";
  }
}

function DocumentCard({
  docType,
  doc,
  employeeId,
  idx,
}: {
  docType: DocumentType;
  doc: Document | undefined;
  employeeId: string;
  idx: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState(false);
  const [viewing, setViewing] = useState(false);
  const { mutateAsync: addDoc, isPending: uploading } = useAddDocument();
  const { mutateAsync: deleteDoc, isPending: deleting } = useDeleteDocument();
  const Icon = DOC_ICONS[docType];
  const isUploaded = !!doc;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);
    try {
      await addDoc({
        employeeId,
        documentType: docType,
        file,
        onProgress: (pct) => setUploadProgress(pct),
      });
      toast.success(`"${DOC_LABELS[docType]}" uploaded successfully!`);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc({ employeeId, documentType: docType });
      toast.success(`"${DOC_LABELS[docType]}" deleted.`);
    } catch {
      toast.error("Failed to delete document.");
    }
    setDeleteTarget(false);
  };

  const handleView = async () => {
    if (!doc) return;
    setViewing(true);
    try {
      const bytes: Uint8Array = await doc.blobId.getBytes();
      const mimeType = getMimeType(doc.fileName);
      const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error("Failed to view document.");
    } finally {
      setViewing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.3 }}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
        isUploaded
          ? "bg-green-50/50 border-green-200"
          : "bg-card border-border hover:border-border"
      }`}
      data-ocid={`employee_detail.documents.item.${idx + 1}`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUploaded ? "bg-green-100" : "bg-muted"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${isUploaded ? "text-green-600" : "text-muted-foreground"}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {DOC_LABELS[docType]}
        </p>
        {isUploaded && doc ? (
          <p className="text-xs text-muted-foreground mt-0.5">
            {doc.fileName} &bull; {formatFileSize(doc.fileSize)} &bull;{" "}
            {formatDate(doc.uploadedAt)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">Not uploaded</p>
        )}
        {uploadProgress !== null && (
          <div className="mt-1.5">
            <Progress value={uploadProgress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-0.5">
              {uploadProgress}% uploaded
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isUploaded && doc ? (
          <>
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Uploaded
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={handleView}
              disabled={viewing}
              data-ocid={`employee_detail.documents.view_button.${idx + 1}`}
            >
              {viewing ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <Eye className="w-3.5 h-3.5 mr-1" />
              )}
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2 text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => setDeleteTarget(true)}
              disabled={deleting}
              data-ocid={`employee_detail.documents.delete_button.${idx + 1}`}
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </>
        ) : (
          <>
            <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
              <Clock className="w-3 h-3 mr-1" /> Pending
            </Badge>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept="image/*,.pdf,.doc,.docx"
            />
            <Button
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              data-ocid={`employee_detail.documents.upload_button.${idx + 1}`}
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5 mr-1" />
              )}
              Upload
            </Button>
          </>
        )}
      </div>

      <AlertDialog open={deleteTarget} onOpenChange={setDeleteTarget}>
        <AlertDialogContent data-ocid="employee_detail.documents.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{DOC_LABELS[docType]}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="employee_detail.documents.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="employee_detail.documents.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

export function EmployeeDetailPage() {
  const { employeeId } = useParams({ from: "/employees/$employeeId" });
  const navigate = useNavigate();
  const { data: employee, isLoading: empLoading } = useGetEmployee(employeeId);
  const { data: documents = [], isLoading: docsLoading } =
    useGetDocuments(employeeId);

  const docMap = new Map<DocumentType, Document>(
    documents.map((d) => [d.documentType, d]),
  );
  const completedCount = documents.length;
  const completionPct = (completedCount / TOTAL_DOC_TYPES) * 100;

  if (empLoading) {
    return (
      <div className="p-6" data-ocid="employee_detail.loading_state">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 text-center" data-ocid="employee_detail.error_state">
        <p className="text-muted-foreground">Employee not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate({ to: "/" })}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/" })}
          className="-ml-2 text-muted-foreground"
          data-ocid="employee_detail.back.button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-foreground mt-2">
          Employee Details
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <Card className="shadow-card" data-ocid="employee_detail.info.card">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">
                    {getInitials(employee.name)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {employee.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {employee.employeeId}
                </p>
                <Badge variant="outline" className="mt-2">
                  {employee.department}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground truncate">
                    {employee.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{employee.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">
                    Joined {formatDate(employee.joinDate)}
                  </span>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-muted/40">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Document Completion
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {completedCount}/{TOTAL_DOC_TYPES}
                  </span>
                </div>
                <Progress value={completionPct} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {Math.round(completionPct)}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <Card
            className="shadow-card"
            data-ocid="employee_detail.documents.card"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Document Verification
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {completedCount} / {TOTAL_DOC_TYPES} uploaded
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {docsLoading ? (
                <div
                  className="space-y-3"
                  data-ocid="employee_detail.documents.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                ALL_DOC_TYPES.map((docType, idx) => (
                  <DocumentCard
                    key={docType}
                    docType={docType}
                    doc={docMap.get(docType)}
                    employeeId={employeeId}
                    idx={idx}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
