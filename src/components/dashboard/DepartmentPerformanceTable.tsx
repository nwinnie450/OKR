import { useState } from "react";
import { ArrowUpDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DepartmentData {
  id: string;
  name: string;
  okrCount: number;
  progress: number;
  status: "on-track" | "at-risk" | "off-track";
}

interface DepartmentPerformanceTableProps {
  departments: DepartmentData[];
  onDepartmentClick?: (departmentId: string) => void;
}

type SortField = "name" | "okrCount" | "progress";
type SortDirection = "asc" | "desc";

export default function DepartmentPerformanceTable({
  departments,
  onDepartmentClick,
}: DepartmentPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>("progress");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedDepartments = [...departments].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    if (sortField === "name") {
      return multiplier * a.name.localeCompare(b.name);
    }
    return multiplier * (a[sortField] - b[sortField]);
  });

  const getStatusBadge = (status: DepartmentData["status"]) => {
    const variants = {
      "on-track": { variant: "default" as const, label: "On Track", color: "bg-green-100 text-green-700 border-green-200" },
      "at-risk": { variant: "secondary" as const, label: "At Risk", color: "bg-amber-100 text-amber-700 border-amber-200" },
      "off-track": { variant: "destructive" as const, label: "Off Track", color: "bg-red-100 text-red-700 border-red-200" },
    };
    const config = variants[status];
    return (
      <Badge className={cn("border", config.color)}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Department Performance</CardTitle>
        <Button variant="outline" size="sm">
          Export Report
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("name")}
                    className="font-semibold"
                  >
                    Team
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="text-left p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("okrCount")}
                    className="font-semibold"
                  >
                    OKRs
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="text-left p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("progress")}
                    className="font-semibold"
                  >
                    Progress
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="text-left p-4">
                  <span className="font-semibold text-sm">Status</span>
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {sortedDepartments.map((dept) => (
                <tr
                  key={dept.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onDepartmentClick?.(dept.id)}
                >
                  <td className="p-4">
                    <span className="font-medium text-slate-900">
                      {dept.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-600">{dept.okrCount}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <Progress value={dept.progress} className="flex-1" />
                      <span className="text-sm font-medium text-slate-700 min-w-[45px]">
                        {dept.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(dept.status)}</td>
                  <td className="p-4">
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {sortedDepartments.map((dept) => (
            <div
              key={dept.id}
              className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => onDepartmentClick?.(dept.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-900">{dept.name}</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {dept.okrCount} OKRs
                  </p>
                </div>
                {getStatusBadge(dept.status)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium text-slate-900">
                    {dept.progress}%
                  </span>
                </div>
                <Progress value={dept.progress} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
