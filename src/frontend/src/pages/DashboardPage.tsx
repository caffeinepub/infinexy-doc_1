import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { CheckCircle, Eye, FileText, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { AddEmployeeModal } from "../components/AddEmployeeModal";
import { useGetDocumentStats, useGetEmployees } from "../hooks/useQueries";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

const TOTAL_DOCS = 10;

function StatusBadge({ count }: { count: number }) {
  if (count === TOTAL_DOCS)
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 font-medium">
        Complete
      </Badge>
    );
  if (count === 0)
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 font-medium">
        Pending
      </Badge>
    );
  return (
    <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
      In Progress
    </Badge>
  );
}

export function DashboardPage() {
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const { data: employees = [], isLoading: empLoading } = useGetEmployees();
  const { data: stats, isLoading: statsLoading } = useGetDocumentStats();

  const kpiCards = [
    {
      title: "Total Employees",
      value: statsLoading ? "—" : String(stats?.totalEmployees ?? 0),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Documents",
      value: statsLoading ? "—" : String(stats?.totalDocuments ?? 0),
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Completion Rate",
      value: statsLoading
        ? "—"
        : `${Math.round((stats?.completionRate ?? 0) * 100) / 100}%`,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Employee Document Dashboard
        </h1>
        <p className="text-muted-foreground mt-0.5">
          Manage and track all employee documents in one place.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
          >
            <Card
              className="shadow-card border-border"
              data-ocid={`dashboard.kpi.${i + 1}.card`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}
                  >
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Employee Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
      >
        <Card
          className="shadow-card border-border"
          data-ocid="dashboard.employees.table"
        >
          <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
            <CardTitle className="text-base font-semibold">
              Employee List
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              data-ocid="dashboard.add_employee.primary_button"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Employee
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {empLoading ? (
              <div
                className="p-6 space-y-3"
                data-ocid="dashboard.employees.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : employees.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                data-ocid="dashboard.employees.empty_state"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  No employees yet
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Add your first employee to get started.
                </p>
                <Button
                  size="sm"
                  onClick={() => setAddOpen(true)}
                  data-ocid="dashboard.employees_empty.add_employee.primary_button"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add Employee
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="pl-6">Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp, idx) => (
                      <TableRow
                        key={emp.employeeId}
                        className="hover:bg-muted/20 transition-colors"
                        data-ocid={`dashboard.employees.item.${idx + 1}`}
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback
                                className={`${getAvatarColor(emp.name)} text-white text-sm font-semibold`}
                              >
                                {getInitials(emp.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {emp.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {emp.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-foreground">
                            {emp.department}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={0} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              View for details
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge count={0} />
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate({
                                to: "/employees/$employeeId",
                                params: { employeeId: emp.employeeId },
                              })
                            }
                            data-ocid={`dashboard.employees.view_button.${idx + 1}`}
                          >
                            <Eye className="w-4 h-4 mr-1.5" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AddEmployeeModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
