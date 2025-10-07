import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/ui/circular-progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Target,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  CalendarClock,
  Loader2,
} from 'lucide-react';
import type { Objective, KeyResult } from '@/types/okr';
import { useObjectives } from '@/hooks/useObjectives';
import { useAuth } from '@/contexts/AuthContext';

// Mock data
const mockUserObjectives: Objective[] = [
  {
    id: 'obj-1',
    title: 'Improve Product User Experience',
    description: 'Enhance user satisfaction and engagement across all touchpoints',
    type: 'individual',
    ownerId: 'user-1',
    timePeriod: 'Q4',
    year: 2025,
    status: 'active',
    progress: 68,
    confidence: 'on-track',
    keyResultIds: ['kr-1', 'kr-2', 'kr-3'],
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-09-20T00:00:00Z',
  },
  {
    id: 'obj-2',
    title: 'Launch New Features Successfully',
    description: 'Deliver high-quality features on time with minimal bugs',
    type: 'individual',
    ownerId: 'user-1',
    timePeriod: 'Q4',
    year: 2025,
    status: 'active',
    progress: 45,
    confidence: 'at-risk',
    keyResultIds: ['kr-4', 'kr-5'],
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-09-15T00:00:00Z',
  },
];

const mockKeyResults: KeyResult[] = [
  {
    id: 'kr-1',
    objectiveId: 'obj-1',
    title: 'Increase NPS score from 45 to 65',
    metricType: 'number',
    startingValue: 45,
    currentValue: 58,
    target: 65,
    unit: 'points',
    progress: 65,
    confidence: 'on-track',
    ownerId: 'user-1',
    lastCheckinAt: '2025-09-25T00:00:00Z',
    status: 'active',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-09-25T00:00:00Z',
  },
  {
    id: 'kr-2',
    objectiveId: 'obj-1',
    title: 'Reduce average page load time to under 2 seconds',
    metricType: 'number',
    startingValue: 4.5,
    currentValue: 2.8,
    target: 2.0,
    unit: 'seconds',
    progress: 68,
    confidence: 'on-track',
    ownerId: 'user-1',
    lastCheckinAt: '2025-09-23T00:00:00Z',
    status: 'active',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-09-23T00:00:00Z',
  },
  {
    id: 'kr-3',
    objectiveId: 'obj-1',
    title: 'Achieve 90% mobile app crash-free rate',
    metricType: 'percentage',
    startingValue: 82,
    currentValue: 87,
    target: 90,
    unit: '%',
    progress: 62,
    confidence: 'on-track',
    ownerId: 'user-1',
    lastCheckinAt: '2025-09-20T00:00:00Z',
    status: 'active',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-09-20T00:00:00Z',
  },
  {
    id: 'kr-4',
    objectiveId: 'obj-2',
    title: 'Ship 5 new product features',
    metricType: 'number',
    startingValue: 0,
    currentValue: 2,
    target: 5,
    unit: 'features',
    progress: 40,
    confidence: 'at-risk',
    ownerId: 'user-1',
    lastCheckinAt: '2025-09-10T00:00:00Z',
    status: 'active',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-09-10T00:00:00Z',
  },
  {
    id: 'kr-5',
    objectiveId: 'obj-2',
    title: 'Maintain bug count below 10 critical issues',
    metricType: 'number',
    startingValue: 15,
    currentValue: 12,
    target: 10,
    unit: 'bugs',
    progress: 50,
    confidence: 'at-risk',
    ownerId: 'user-1',
    lastCheckinAt: undefined,
    status: 'active',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
  },
];

export default function MemberDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPeriod] = useState("Q4");
  const [selectedYear] = useState(2025);

  // Fetch user's objectives
  const { data: objectivesData, isLoading } = useObjectives({
    timePeriod: selectedPeriod as 'Q1' | 'Q2' | 'Q3' | 'Q4',
    year: selectedYear,
    ownerId: user?.id, // Filter by current user
  });

  const objectives = objectivesData || [];

  // Calculate stats
  const stats = {
    totalOKRs: objectives.length,
    onTrack: objectives.filter(o => o.confidence === 'on-track').length,
    atRisk: objectives.filter(o => o.confidence === 'at-risk').length,
    offTrack: objectives.filter(o => o.confidence === 'off-track').length,
    avgProgress: objectives.length > 0
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length)
      : 0,
  };

  // Calculate overdue key results (mock data - should be calculated from real data)
  const overdueKRs = mockKeyResults.filter(kr => !kr.lastCheckinAt ||
    (new Date().getTime() - new Date(kr.lastCheckinAt).getTime()) > 7 * 24 * 60 * 60 * 1000
  );

  const getStatusBadge = (confidence: string) => {
    const config = {
      'on-track': { label: 'On Track', class: 'bg-green-100 text-green-700 border-green-200' },
      'at-risk': { label: 'At Risk', class: 'bg-amber-100 text-amber-700 border-amber-200' },
      'off-track': { label: 'Off Track', class: 'bg-red-100 text-red-700 border-red-200' },
    };
    const status = config[confidence as keyof typeof config] || config['on-track'];
    return <Badge className={status.class}>{status.label}</Badge>;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My OKRs" description="Track your personal objectives and key results">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading your OKRs...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My OKRs"
      description="Track your personal objectives and key results"
    >
      <div className="space-y-6">
        {/* Check-in Nudge Banner */}
        {stats.atRisk > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                    <CalendarClock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900 mb-1">
                    {stats.atRisk} OKR{stats.atRisk !== 1 ? 's' : ''} Need Attention!
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    Review and update your objectives that are at risk. Quick check-ins help keep your goals on track! ⚡
                  </p>
                  <Button
                    onClick={() => navigate('/checkin')}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Update Progress (2 min)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total OKRs</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalOKRs}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedPeriod} {selectedYear}</p>
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
                  <p className="text-xs text-slate-500 mt-1">{stats.totalOKRs > 0 ? Math.round((stats.onTrack / stats.totalOKRs) * 100) : 0}%</p>
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
                  <p className="text-xs text-amber-600 mt-1">{stats.offTrack} off track</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Avg Progress</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.avgProgress}%</p>
                  <p className="text-xs text-slate-500 mt-1">Overall completion</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Objectives */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">My Objectives</h2>
            <Button onClick={() => navigate('/okr/new')} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New OKR
            </Button>
          </div>

          {objectives.length === 0 ? (
            /* Empty State */
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No objectives yet
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Start your journey by creating your first OKR. Set ambitious goals and track your progress!
                </p>
                <Button onClick={() => navigate('/okr/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First OKR
                </Button>
              </CardContent>
            </Card>
          ) : (
            objectives.map(objective => {
              const status = objective.confidence === 'on-track' ? 'on-track' :
                            objective.confidence === 'at-risk' ? 'at-risk' : 'off-track';

              return (
                <Card
                  key={objective._id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/okr/${objective._id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-xl">{objective.title}</CardTitle>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{objective.description}</p>
                      </div>
                      <CircularProgress
                        value={objective.progress}
                        size={80}
                        strokeWidth={8}
                        status={status}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(objective.confidence)}
                      </div>
                      <div className="text-sm text-slate-600">
                        {objective.timePeriod} {objective.year}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/okr/${objective._id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active OKRs</p>
                  <p className="text-3xl font-bold text-slate-900">{mockUserObjectives.length}</p>
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
                  <p className="text-sm text-slate-600 mb-1">Avg Progress</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {Math.round(mockUserObjectives.reduce((acc, obj) => acc + obj.progress, 0) / mockUserObjectives.length || 0)}%
                  </p>
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
                  <p className="text-sm text-slate-600 mb-1">Key Results</p>
                  <p className="text-3xl font-bold text-slate-900">{mockKeyResults.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Need Update</p>
                  <p className="text-3xl font-bold text-slate-900">{overdueKRs.length}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  overdueKRs.length > 0 ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                  <Clock className={`h-6 w-6 ${
                    overdueKRs.length > 0 ? 'text-amber-600' : 'text-slate-400'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
