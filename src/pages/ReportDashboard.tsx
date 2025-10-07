import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Award,
  Download,
  Filter,
  Calendar,
  Loader2,
} from 'lucide-react';
import { useObjectives } from '@/hooks/useObjectives';
import { Badge } from '@/components/ui/badge';

export default function ReportDashboard() {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedPeriod, setSelectedPeriod] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'company' | 'team' | 'individual'>('all');

  // Fetch all objectives for analytics
  const { data: objectivesData, isLoading } = useObjectives({
    year: parseInt(selectedYear),
    ...(selectedPeriod !== 'all' && { timePeriod: selectedPeriod }),
    ...(selectedType !== 'all' && { type: selectedType as any }),
  });

  const objectives = objectivesData || [];

  // Calculate stats
  const totalOKRs = objectives.length;
  const completedOKRs = objectives.filter((o) => o.status === 'completed').length;
  const onTrackOKRs = objectives.filter((o) => o.confidence === 'on-track').length;
  const atRiskOKRs = objectives.filter((o) => o.confidence === 'at-risk').length;
  const offTrackOKRs = objectives.filter((o) => o.confidence === 'off-track').length;
  const avgProgress =
    objectives.length > 0
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length)
      : 0;
  const completionRate = totalOKRs > 0 ? Math.round((completedOKRs / totalOKRs) * 100) : 0;

  // Chart data - Progress by Quarter
  const progressByQuarter = [
    {
      quarter: 'Q1',
      avgProgress: Math.round(
        objectives
          .filter((o) => o.timePeriod === 'Q1')
          .reduce((sum, o, _, arr) => sum + o.progress / arr.length, 0) || 0
      ),
    },
    {
      quarter: 'Q2',
      avgProgress: Math.round(
        objectives
          .filter((o) => o.timePeriod === 'Q2')
          .reduce((sum, o, _, arr) => sum + o.progress / arr.length, 0) || 0
      ),
    },
    {
      quarter: 'Q3',
      avgProgress: Math.round(
        objectives
          .filter((o) => o.timePeriod === 'Q3')
          .reduce((sum, o, _, arr) => sum + o.progress / arr.length, 0) || 0
      ),
    },
    {
      quarter: 'Q4',
      avgProgress: Math.round(
        objectives
          .filter((o) => o.timePeriod === 'Q4')
          .reduce((sum, o, _, arr) => sum + o.progress / arr.length, 0) || 0
      ),
    },
  ];

  // Chart data - OKRs by Type
  const okrsByType = [
    { name: 'Company', value: objectives.filter((o) => o.type === 'company').length, color: '#3b82f6' },
    { name: 'Team', value: objectives.filter((o) => o.type === 'team').length, color: '#10b981' },
    { name: 'Individual', value: objectives.filter((o) => o.type === 'individual').length, color: '#f59e0b' },
  ];

  // Chart data - Confidence Distribution
  const confidenceData = [
    { name: 'On Track', value: onTrackOKRs, color: '#10b981' },
    { name: 'At Risk', value: atRiskOKRs, color: '#f59e0b' },
    { name: 'Off Track', value: offTrackOKRs, color: '#ef4444' },
  ];

  // Top performing OKRs
  const topPerformers = [...objectives]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);

  const handleExportCSV = () => {
    const csvData = [
      ['Title', 'Type', 'Period', 'Progress', 'Confidence', 'Status'],
      ...objectives.map((o) => [
        o.title,
        o.type,
        `${o.timePeriod} ${o.year}`,
        `${o.progress}%`,
        o.confidence,
        o.status,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + csvData.map((row) => row.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `okr-report-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Reports & Analytics" description="Company-wide OKR insights">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading analytics...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Reports & Analytics"
      description="Company-wide OKR performance insights"
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-slate-600" />
                <div className="flex gap-3">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedPeriod} onValueChange={(v: any) => setSelectedPeriod(v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Periods</SelectItem>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total OKRs</p>
                  <p className="text-3xl font-bold text-slate-900">{totalOKRs}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedYear}</p>
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
                  <p className="text-sm text-slate-600 mb-1">Completion Rate</p>
                  <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600">+12% from last quarter</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Avg Progress</p>
                  <p className="text-3xl font-bold text-slate-900">{avgProgress}%</p>
                  <p className="text-xs text-slate-500 mt-1">Across all OKRs</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">At Risk</p>
                  <p className="text-3xl font-bold text-slate-900">{atRiskOKRs + offTrackOKRs}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <p className="text-xs text-red-600">Needs attention</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Trend by Quarter</CardTitle>
              <CardDescription>Average progress across all quarters</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressByQuarter}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgProgress"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Avg Progress (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* OKRs by Type */}
          <Card>
            <CardHeader>
              <CardTitle>OKRs by Type</CardTitle>
              <CardDescription>Distribution across organization levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={okrsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {okrsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Confidence Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Confidence Distribution</CardTitle>
              <CardDescription>Health status of all OKRs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="#3b82f6">
                    {confidenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing OKRs</CardTitle>
              <CardDescription>Highest progress objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.length > 0 ? (
                  topPerformers.map((okr, index) => (
                    <div
                      key={okr._id}
                      className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {okr.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {okr.type} • {okr.timePeriod} {okr.year}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge
                          className={
                            okr.progress >= 90
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : okr.progress >= 70
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-amber-100 text-amber-700 border-amber-200'
                          }
                        >
                          {okr.progress}%
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No OKRs available for selected filters
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
