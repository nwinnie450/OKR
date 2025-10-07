import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/ui/circular-progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useObjectives } from '@/hooks/useObjectives';
import { useTeams } from '@/hooks/useTeams';
import type { Objective as APIObjective } from '@/lib/api';

// Legacy mock data for fallback
const mockObjectives: any[] = [
  {
    id: 'obj-1',
    title: 'Improve Product User Experience',
    description: 'Enhance user satisfaction and engagement across all touchpoints',
    type: 'team',
    ownerId: 'user-1',
    teamId: 'team-product',
    timePeriod: 'Q4',
    year: 2025,
    status: 'active',
    progress: 68,
    confidence: 'on-track',
    keyResultIds: ['kr-1', 'kr-2', 'kr-3'],
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-09-25T00:00:00Z',
  },
  {
    id: 'obj-2',
    title: 'Launch New Mobile App Features',
    description: 'Deliver high-quality mobile features on time',
    type: 'team',
    ownerId: 'user-2',
    teamId: 'team-product',
    timePeriod: 'Q4',
    year: 2025,
    status: 'active',
    progress: 45,
    confidence: 'at-risk',
    keyResultIds: ['kr-4', 'kr-5'],
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-09-20T00:00:00Z',
  },
  {
    id: 'obj-3',
    title: 'Expand Market Reach',
    description: 'Grow user base and increase brand awareness',
    type: 'company',
    ownerId: 'user-admin',
    timePeriod: 'Q4',
    year: 2025,
    status: 'active',
    progress: 82,
    confidence: 'on-track',
    keyResultIds: ['kr-6', 'kr-7', 'kr-8'],
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-09-24T00:00:00Z',
  },
  {
    id: 'obj-4',
    title: 'Build Sales Pipeline',
    description: 'Establish strong sales processes and targets',
    type: 'team',
    ownerId: 'user-3',
    teamId: 'team-sales',
    timePeriod: 'Q4',
    year: 2025,
    status: 'active',
    progress: 55,
    confidence: 'at-risk',
    keyResultIds: ['kr-9', 'kr-10'],
    createdAt: '2025-07-15T00:00:00Z',
    updatedAt: '2025-09-22T00:00:00Z',
  },
  {
    id: 'obj-5',
    title: 'Improve Engineering Velocity',
    description: 'Increase team productivity and code quality',
    type: 'team',
    ownerId: 'user-4',
    teamId: 'team-engineering',
    timePeriod: 'Q4',
    year: 2025,
    status: 'active',
    progress: 72,
    confidence: 'on-track',
    keyResultIds: ['kr-11', 'kr-12', 'kr-13'],
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-09-26T00:00:00Z',
  },
];

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'on-track' | 'at-risk' | 'off-track';
type FilterType = 'all' | 'company' | 'team' | 'individual';

export default function OKRList() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'progress' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch objectives and teams from API
  const { data: objectivesData, isLoading, error } = useObjectives();
  const { data: teams } = useTeams();
  const objectives = objectivesData || [];
  const teamsList = teams || [];

  // Filter and sort objectives
  const filteredObjectives = useMemo(() => {
    return objectives
      .filter((obj) => {
        // Search filter
        if (searchQuery && !obj.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !(obj.description?.toLowerCase().includes(searchQuery.toLowerCase()))) {
          return false;
        }

        // Status filter
        if (filterStatus !== 'all' && obj.confidence !== filterStatus) {
          return false;
        }

        // Type filter
        if (filterType !== 'all' && obj.type !== filterType) {
          return false;
        }

        // Period filter
        if (filterPeriod !== 'all' && obj.timePeriod !== filterPeriod) {
          return false;
        }

        // Team filter
        if (filterTeam !== 'all') {
          const objTeamId = typeof obj.team === 'object' ? obj.team?._id : obj.team;
          if (objTeamId !== filterTeam) return false;
        }

        // Year filter
        if (filterYear !== 'all' && obj.year?.toString() !== filterYear) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;

        if (sortBy === 'title') {
          comparison = a.title.localeCompare(b.title);
        } else if (sortBy === 'progress') {
          comparison = (a.progress || 0) - (b.progress || 0);
        } else if (sortBy === 'updated') {
          comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [objectives, searchQuery, filterStatus, filterType, filterPeriod, filterTeam, filterYear, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterType('all');
    setFilterPeriod('all');
    setFilterTeam('all');
    setFilterYear('all');
    setSortBy('updated');
    setSortOrder('desc');
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (filterType !== 'all' ? 1 : 0) +
    (filterPeriod !== 'all' ? 1 : 0) +
    (filterTeam !== 'all' ? 1 : 0) +
    (filterYear !== 'all' ? 1 : 0);

  // Get unique years from objectives
  const availableYears = useMemo(() => {
    const years = new Set(objectives.map(obj => obj.year).filter(Boolean));
    return Array.from(years).sort((a, b) => b - a);
  }, [objectives]);

  const getStatusBadge = (confidence: string) => {
    const config = {
      'on-track': { label: 'On Track', class: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
      'at-risk': { label: 'At Risk', class: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
      'off-track': { label: 'Off Track', class: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
    };
    const status = config[confidence as keyof typeof config] || config['on-track'];
    const Icon = status.icon;
    return (
      <Badge className={status.class}>
        <Icon className="h-3 w-3 mr-1" />
        {status.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = useMemo(() => ({
    total: objectives.length,
    onTrack: objectives.filter((obj) => obj.confidence === 'on-track').length,
    atRisk: objectives.filter((obj) => obj.confidence === 'at-risk').length,
    offTrack: objectives.filter((obj) => obj.confidence === 'off-track').length,
  }), [objectives]);

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="All OKRs" description="Browse and manage objectives across the organization">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading OKRs...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="All OKRs" description="Browse and manage objectives across the organization">
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <span className="ml-3 text-red-600">Failed to load OKRs. Please try again.</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="All OKRs" description="Browse and manage objectives across the organization">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total OKRs</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">On Track</p>
                  <p className="text-2xl font-bold text-green-600">{stats.onTrack}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">At Risk</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.atRisk}</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Off Track</p>
                  <p className="text-2xl font-bold text-red-600">{stats.offTrack}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">
                    {activeFilterCount} active
                  </Badge>
                )}
              </CardTitle>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* First Row: Search, Status, Type */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search OKRs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="on-track">On Track</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="off-track">Off Track</SelectItem>
                  </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Second Row: Period, Team, Year, Sort */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Period Filter */}
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>

                {/* Team Filter */}
                <Select value={filterTeam} onValueChange={setFilterTeam}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teamsList.map((team) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Filter */}
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select value={sortBy} onValueChange={(value: 'title' | 'progress' | 'updated') => setSortBy(value)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Sort by Title</SelectItem>
                    <SelectItem value="progress">Sort by Progress</SelectItem>
                    <SelectItem value="updated">Sort by Updated</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Order */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>

                {/* View Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Create Button */}
                <Button onClick={() => navigate('/okr/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  New OKR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OKR List/Grid */}
        {filteredObjectives.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No OKRs found</h3>
              <p className="text-slate-600 mb-6">
                {activeFilterCount > 0
                  ? 'No OKRs match your filters. Try adjusting your search criteria.'
                  : 'Get started by creating your first OKR'}
              </p>
              {activeFilterCount === 0 && (
                <Button onClick={() => navigate('/okr/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create OKR
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {filteredObjectives.map((obj) => {
              const status = obj.confidence === 'on-track' ? 'on-track' :
                            obj.confidence === 'at-risk' ? 'at-risk' : 'off-track';

              return (
                <Card
                  key={obj._id}
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/okr/${obj._id}`)}
                >
                  <CardContent className={viewMode === 'grid' ? 'p-6' : 'p-6'}>
                    <div className={viewMode === 'grid' ? 'space-y-4' : 'flex items-start gap-6'}>
                      {/* Progress Ring */}
                      <div className={viewMode === 'grid' ? 'flex items-center justify-between' : 'flex-shrink-0'}>
                        <CircularProgress
                          value={obj.progress}
                          size={viewMode === 'grid' ? 80 : 100}
                          strokeWidth={8}
                          status={status}
                        />
                      </div>

                      {/* Content */}
                      <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-slate-900 line-clamp-2 flex-1">
                            {obj.title}
                          </h3>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{obj.description}</p>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {getStatusBadge(obj.confidence)}
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 capitalize">
                            {obj.type}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            {obj.timePeriod} {obj.year}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {obj.keyResults?.length || 0} Key Results
                          </span>
                          <span>Updated {formatDate(obj.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
