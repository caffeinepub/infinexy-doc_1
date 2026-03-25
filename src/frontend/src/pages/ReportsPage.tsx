import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2, FileCheck, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { useGetDocumentStats, useGetEmployees } from "../hooks/useQueries";

export function ReportsPage() {
  const { data: employees = [], isLoading: empLoading } = useGetEmployees();
  const { data: stats, isLoading: statsLoading } = useGetDocumentStats();

  const isLoading = empLoading || statsLoading;

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-0.5">
          Overview of document management statistics.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Employees",
            value: String(stats?.totalEmployees ?? 0),
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: "Total Documents",
            value: String(stats?.totalDocuments ?? 0),
            icon: FileCheck,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            title: "Completion Rate",
            value: `${Math.round((stats?.completionRate ?? 0) * 100) / 100}%`,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            title: "Pending Documents",
            value:
              employees.length > 0
                ? String(
                    employees.length * 10 - Number(stats?.totalDocuments ?? 0),
                  )
                : "0",
            icon: BarChart2,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              className="shadow-card"
              data-ocid={`reports.kpi.${i + 1}.card`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold mt-1">{card.value}</p>
                    )}
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Document Completion Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium">
                      Overall Completion
                    </span>
                    <span className="text-sm text-primary font-bold">
                      {Math.round((stats?.completionRate ?? 0) * 100) / 100}%
                    </span>
                  </div>
                  <Progress
                    value={stats?.completionRate ?? 0}
                    className="h-3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center p-4 rounded-xl bg-muted/40">
                    <p className="text-3xl font-bold text-foreground">
                      {String(stats?.totalEmployees ?? 0)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total Employees
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/40">
                    <p className="text-3xl font-bold text-foreground">
                      {String(stats?.totalDocuments ?? 0)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Documents Uploaded
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
