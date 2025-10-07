import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Download,
  Archive,
  ArrowUp,
  Activity,
  Users,
  MessageSquare,
  Shield,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useObjectives } from "@/hooks/useObjectives";
import { useDepartments } from "@/hooks/useDepartments";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("Q4");
  const [selectedYear] = useState(2025);

  // Fetch all objectives for company-wide view
  const { data: objectivesData, isLoading } = useObjectives({
    timePeriod: selectedPeriod as 'Q1' | 'Q2' | 'Q3' | 'Q4',
    year: selectedYear,
  });

  // Fetch departments
  const { data: departmentsData, isLoading: isDepartmentsLoading } = useDepartments();

  const objectives = objectivesData || [];
  const departments = departmentsData || [];

  // Calculate stats from real data
  const stats = {
    totalOKRs: objectives.length,
    onTrack: objectives.filter(o => o.confidence === 'on-track').length,
    atRisk: objectives.filter(o => o.confidence === 'at-risk').length,
    offTrack: objectives.filter(o => o.confidence === 'off-track').length,
    avgProgress: objectives.length > 0
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length)
      : 0,
    companyScore: objectives.length > 0
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length)
      : 0,
  };

  const atRiskOKRs = objectives.filter(o => o.confidence === 'at-risk' || o.confidence === 'off-track');

  // Calculate department stats from objectives
  const departmentStats = departments.map(dept => {
    const deptObjectives = objectives.filter(o => o.department === dept._id);
    const progress = deptObjectives.length > 0
      ? Math.round(deptObjectives.reduce((sum, o) => sum + o.progress, 0) / deptObjectives.length)
      : 0;

    const status = progress >= 70 ? 'on-track' as const : progress >= 50 ? 'at-risk' as const : 'off-track' as const;

    return {
      id: dept._id,
      name: dept.name,
      okrCount: deptObjectives.length,
      progress,
      status,
      members: dept.memberCount || 0,
    };
  });

  const getStatusBadge = (status: string) => {
    const config = {
      'on-track': { label: 'On Track', class: 'bg-green-100 text-green-700 border-green-200' },
      'at-risk': { label: 'At Risk', class: 'bg-amber-100 text-amber-700 border-amber-200' },
      'off-track': { label: 'Off Track', class: 'bg-red-100 text-red-700 border-red-200' },
    };
    const statusConfig = config[status as keyof typeof config] || config['on-track'];
    return <Badge className={statusConfig.class}>{statusConfig.label}</Badge>;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Admin Dashboard" description="Company-wide OKR overview and management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      description="Company-wide OKR overview and management"
    >
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex justify-end">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q4">Q4 2025</SelectItem>
              <SelectItem value="Q3">Q3 2025</SelectItem>
              <SelectItem value="Q2">Q2 2025</SelectItem>
              <SelectItem value="Q1">Q1 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Company Health Score */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-white to-green-50">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Company Health Score</h2>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  Overall performance across all departments for {selectedPeriod} {selectedYear}
                </p>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total OKRs</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalOKRs}</p>
                    <p className="text-xs text-slate-500 mt-1">Active objectives</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Avg Progress</p>
                    <p className="text-3xl font-bold text-green-600">{stats.avgProgress}%</p>
                    <p className="text-xs text-slate-500 mt-1">Across all OKRs</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">On Track</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.onTrack}</p>
                    <p className="text-xs text-slate-500 mt-1">{stats.totalOKRs > 0 ? Math.round((stats.onTrack / stats.totalOKRs) * 100) : 0}%</p>
                  </div>
                </div>
              </div>
              <CircularProgress
                value={stats.companyScore}
                size={140}
                strokeWidth={12}
                status={stats.companyScore >= 70 ? 'on-track' : stats.companyScore >= 40 ? 'at-risk' : 'off-track'}
              />
            </div>
          </CardContent>
        </Card>

        {/* At-Risk Alert Banner */}
        {atRiskOKRs.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900 mb-1">
                    {atRiskOKRs.length} OKR{atRiskOKRs.length !== 1 ? 's' : ''} Need Attention
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    Review and take action on objectives that are at risk or off track.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Review All Alerts
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* At-Risk OKRs */}
        {atRiskOKRs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">At-Risk OKRs</h2>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                {atRiskOKRs.length} Active
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {atRiskOKRs.map((okr) => (
                <Card
                  key={okr._id}
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    okr.confidence === 'off-track' ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'
                  }`}
                  onClick={() => navigate(`/okr/${okr._id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Badge className="mb-2 text-xs bg-slate-100 text-slate-700 border-slate-200">
                          {okr.type.charAt(0).toUpperCase() + okr.type.slice(1)}
                        </Badge>
                        <h4 className="font-semibold text-slate-900 mb-1">{okr.title}</h4>
                        <p className="text-xs text-slate-600">{okr.timePeriod} {okr.year}</p>
                      </div>
                      <CircularProgress
                        value={okr.progress}
                        size={56}
                        strokeWidth={6}
                        status={okr.confidence}
                        valueClassName="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Status</span>
                        {getStatusBadge(okr.confidence)}
                      </div>
                      {okr.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">{okr.description}</p>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/okr/${okr._id}`); }}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Department Performance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Department Performance</h2>
            <Button variant="ghost" size="sm">
              View All Departments
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departmentStats.length === 0 && !isDepartmentsLoading ? (
              <div className="col-span-3 text-center py-8 text-slate-500">
                No departments found. Create departments to see performance metrics.
              </div>
            ) : (
              departmentStats.map((dept) => (
                <Card key={dept.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{dept.name}</h3>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span>{dept.okrCount} OKRs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{dept.members} members</span>
                          </div>
                        </div>
                      </div>
                      <CircularProgress
                        value={dept.progress}
                        size={64}
                        strokeWidth={6}
                        status={dept.status}
                        valueClassName="text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(dept.status)}
                      <Button size="sm" variant="ghost" className="text-xs">
                        View →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total OKRs</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalOKRs}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedPeriod} {selectedYear}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">On Track</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.onTrack}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.totalOKRs > 0 ? Math.round((stats.onTrack / stats.totalOKRs) * 100) : 0}% of total
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">At Risk</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.atRisk}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    {stats.offTrack} off track
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Progress</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.avgProgress}%</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Average completion
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button onClick={() => navigate('/okr/new')} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Company OKR
              </Button>
              <Button variant="outline" className="w-full">
                <Archive className="h-4 w-4 mr-2" />
                Archive Cycle
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
