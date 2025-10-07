import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Activity,
  Plus,
  User,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useObjectives } from "@/hooks/useObjectives";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { useTeams } from "@/hooks/useTeams";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPeriod] = useState("Q4");
  const [selectedYear] = useState(2025);

  // Fetch department objectives (for managers, filter by their department)
  const userDepartmentId = user?.departments?.[0];
  const { data: objectivesData, isLoading: isLoadingObjectives } = useObjectives({
    timePeriod: selectedPeriod as 'Q1' | 'Q2' | 'Q3' | 'Q4',
    year: selectedYear,
    departmentId: typeof userDepartmentId === 'string' ? userDepartmentId : userDepartmentId?._id,
  });

  // Fetch department users and teams
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const { data: teamsData, isLoading: isLoadingTeams } = useTeams();

  const isLoading = isLoadingObjectives || isLoadingUsers || isLoadingTeams;

  // Filter to show only department and team OKRs (exclude company OKRs)
  const objectives = (objectivesData || []).filter(okr =>
    okr.type === 'department' || okr.type === 'team'
  );

  // Filter users in the department
  const deptId = typeof userDepartmentId === 'string' ? userDepartmentId : userDepartmentId?._id;
  const departmentUsers = (usersData || []).filter(u =>
    u.departments?.some(d => (typeof d === 'string' ? d : d._id) === deptId)
  );

  // Filter teams in the department
  const departmentTeams = (teamsData || []).filter(t =>
    (typeof t.department === 'string' ? t.department : t.department?._id) === deptId
  );

  // Calculate department stats from REAL data
  const stats = {
    totalOKRs: objectives.length,
    onTrack: objectives.filter(o => o.confidence === 'on-track').length,
    atRisk: objectives.filter(o => o.confidence === 'at-risk').length,
    offTrack: objectives.filter(o => o.confidence === 'off-track').length,
    departmentScore: objectives.length > 0
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length)
      : 0,
    totalMembers: departmentUsers.length,
    totalTeams: departmentTeams.length,
  };

  const atRiskOKRs = objectives.filter(o => o.confidence === 'at-risk' || o.confidence === 'off-track');

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
      <DashboardLayout title="Department Dashboard" description="Department OKR management and tracking">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading department dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Department Dashboard"
      description="Department OKR management and tracking"
    >
      <div className="space-y-6">
        {/* Department Health Score */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Department Health Score</h2>
                </div>
                <p className="text-slate-600 mb-6">
                  Overall department performance and engagement
                </p>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total OKRs</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalOKRs}</p>
                    <p className="text-xs text-slate-500 mt-1">{selectedPeriod} {selectedYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">On Track</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.onTrack}</p>
                    <p className="text-xs text-slate-500 mt-1">{stats.totalOKRs > 0 ? Math.round((stats.onTrack / stats.totalOKRs) * 100) : 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">At Risk</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.atRisk}</p>
                    <p className="text-xs text-slate-500 mt-1">Needs attention</p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <CircularProgress
                  value={stats.departmentScore}
                  size={140}
                  strokeWidth={12}
                  status={stats.departmentScore >= 70 ? 'on-track' : stats.departmentScore >= 40 ? 'at-risk' : 'off-track'}
                  valueClassName="text-3xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Banners */}
        {atRiskOKRs.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    {atRiskOKRs.length} OKR{atRiskOKRs.length !== 1 ? 's' : ''} At Risk
                  </h3>
                  <p className="text-sm text-amber-800 line-clamp-2">
                    Review and provide support for objectives that need attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Department OKRs Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Department OKRs</h2>
            <Button onClick={() => navigate('/okr/new')} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create OKR
            </Button>
          </div>

          {objectives.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Department OKRs Yet</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Create your first department objective to get started
                </p>
                <Button onClick={() => navigate('/okr/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create OKR
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {objectives.map(okr => (
                <Card
                  key={okr._id}
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    okr.confidence === 'at-risk' ? 'border-amber-300 bg-amber-50/30' :
                    okr.confidence === 'off-track' ? 'border-red-300 bg-red-50/30' : ''
                  }`}
                  onClick={() => navigate(`/okr/${okr._id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <CircularProgress
                        value={okr.progress}
                        size={64}
                        strokeWidth={6}
                        status={okr.confidence}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <Badge className="mb-2 text-xs bg-slate-100 text-slate-700 border-slate-200">
                              {okr.type.charAt(0).toUpperCase() + okr.type.slice(1)}
                            </Badge>
                            <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">
                              {okr.title}
                            </h3>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Status</span>
                            {getStatusBadge(okr.confidence)}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Period</span>
                            <span className="text-slate-500">{okr.timePeriod} {okr.year}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Department Stats Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Team Members</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalMembers}</p>
                  <p className="text-xs text-slate-500 mt-1">Active in department</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Teams</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalTeams}</p>
                  <p className="text-xs text-slate-500 mt-1">In department</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Avg Progress</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.departmentScore}%</p>
                  <p className="text-xs text-slate-500 mt-1">Department score</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active OKRs</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalOKRs}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedPeriod} {selectedYear}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    stats.atRisk > 0 ? 'bg-amber-100' : 'bg-slate-100'
                  }`}
                >
                  <Target
                    className={`h-6 w-6 ${
                      stats.atRisk > 0 ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
