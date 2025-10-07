import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  Calendar,
  Users,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  BarChart3,
  Loader2,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useObjective, useUpdateObjective, useDeleteObjective } from '@/hooks/useObjectives';
import { useKeyResults, useUpdateKeyResult, useDeleteKeyResult } from '@/hooks/useKeyResults';
import { useCheckIns, useUpdateCheckIn, useDeleteCheckIn } from '@/hooks/useCheckIns';
import { useToast } from '@/hooks/use-toast';
import type { Objective, KeyResult, CheckIn } from '@/types/okr';

export default function OKRDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedKR, setSelectedKR] = useState<string | null>(null);

  // Edit/Delete states
  const [isEditObjectiveOpen, setIsEditObjectiveOpen] = useState(false);
  const [isDeleteObjectiveOpen, setIsDeleteObjectiveOpen] = useState(false);
  const [editingKR, setEditingKR] = useState<KeyResult | null>(null);
  const [deletingKR, setDeletingKR] = useState<KeyResult | null>(null);
  const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | null>(null);
  const [deletingCheckIn, setDeletingCheckIn] = useState<CheckIn | null>(null);

  // Form state for editing objective
  const [editObjectiveForm, setEditObjectiveForm] = useState({
    title: '',
    description: '',
    category: '',
  });

  // Form state for editing KR
  const [editKRForm, setEditKRForm] = useState({
    title: '',
    description: '',
    targetValue: 0,
  });

  // Form state for editing check-in
  const [editCheckInForm, setEditCheckInForm] = useState({
    currentValue: 0,
    statusComment: '',
    blockers: '',
    achievements: '',
  });

  // Fetch objective data
  const { data: objectiveData, isLoading: isLoadingObjective, error: objectiveError } = useObjective(id || '');
  const { data: keyResultsData, isLoading: isLoadingKRs } = useKeyResults({ objectiveId: id });
  const { data: checkInsData } = useCheckIns({ objectiveId: id });

  // Mutations
  const updateObjective = useUpdateObjective();
  const deleteObjective = useDeleteObjective();
  const updateKeyResult = useUpdateKeyResult();
  const deleteKeyResult = useDeleteKeyResult();
  const updateCheckIn = useUpdateCheckIn();
  const deleteCheckIn = useDeleteCheckIn();

  const objective = objectiveData;
  const keyResults = keyResultsData || [];
  const checkIns = checkInsData || [];

  // Loading state
  if (isLoadingObjective || isLoadingKRs) {
    return (
      <DashboardLayout title="Loading..." description="">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading OKR details...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Error or not found state
  if (objectiveError || !objective) {
    return (
      <DashboardLayout title="OKR Not Found" description="">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">OKR Not Found</h3>
            <p className="text-slate-600 mb-6">The objective you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/okrs')}>Back to OKRs</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (confidence: string) => {
    const config = {
      'on-track': { label: 'On Track', class: 'bg-green-100 text-green-700 border-green-200' },
      'at-risk': { label: 'At Risk', class: 'bg-amber-100 text-amber-700 border-amber-200' },
      'off-track': { label: 'Off Track', class: 'bg-red-100 text-red-700 border-red-200' },
    };
    const status = config[confidence as keyof typeof config] || config['on-track'];
    return <Badge className={status.class}>{status.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeSinceCheckin = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  // Handler functions
  const handleEditObjective = () => {
    if (objective) {
      setEditObjectiveForm({
        title: objective.title,
        description: objective.description || '',
        category: objective.category || '',
      });
      setIsEditObjectiveOpen(true);
    }
  };

  const handleSaveObjective = async () => {
    if (!id) return;

    try {
      await updateObjective.mutateAsync({
        id,
        data: {
          title: editObjectiveForm.title,
          description: editObjectiveForm.description,
          category: editObjectiveForm.category || undefined,
        },
      });

      toast({
        title: 'Objective updated',
        description: 'Your changes have been saved successfully.',
      });
      setIsEditObjectiveOpen(false);
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update objective. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteObjective = async () => {
    if (!id) return;

    try {
      await deleteObjective.mutateAsync(id);

      toast({
        title: 'Objective deleted',
        description: 'The objective has been removed successfully.',
      });
      navigate('/okrs');
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete objective. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditKR = (kr: KeyResult) => {
    setEditingKR(kr);
    setEditKRForm({
      title: kr.title,
      description: kr.description || '',
      targetValue: kr.targetValue,
    });
  };

  const handleSaveKR = async () => {
    if (!editingKR) return;

    try {
      await updateKeyResult.mutateAsync({
        id: editingKR._id,
        data: {
          title: editKRForm.title,
          description: editKRForm.description,
          targetValue: editKRForm.targetValue,
        },
      });

      toast({
        title: 'Key Result updated',
        description: 'Your changes have been saved successfully.',
      });
      setEditingKR(null);
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update key result. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteKR = async () => {
    if (!deletingKR) return;

    try {
      await deleteKeyResult.mutateAsync(deletingKR._id);

      toast({
        title: 'Key Result deleted',
        description: 'The key result has been removed successfully.',
      });
      setDeletingKR(null);
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete key result. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditCheckIn = (checkIn: CheckIn) => {
    setEditingCheckIn(checkIn);
    setEditCheckInForm({
      currentValue: checkIn.currentValue,
      statusComment: checkIn.statusComment || '',
      blockers: checkIn.blockers || '',
      achievements: checkIn.achievements || '',
    });
  };

  const handleSaveCheckIn = async () => {
    if (!editingCheckIn) return;

    try {
      await updateCheckIn.mutateAsync({
        id: editingCheckIn._id,
        data: {
          currentValue: editCheckInForm.currentValue,
          statusComment: editCheckInForm.statusComment,
          blockers: editCheckInForm.blockers,
          achievements: editCheckInForm.achievements,
        },
      });

      toast({
        title: 'Check-in updated',
        description: 'Your changes have been saved successfully.',
      });
      setEditingCheckIn(null);
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update check-in. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCheckIn = async () => {
    if (!deletingCheckIn) return;

    try {
      await deleteCheckIn.mutateAsync(deletingCheckIn._id);

      toast({
        title: 'Check-in deleted',
        description: 'The check-in has been removed successfully.',
      });
      setDeletingCheckIn(null);
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete check-in. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout
      title={objective.title}
      description={`${objective.type.charAt(0).toUpperCase() + objective.type.slice(1)} Objective · ${objective.timePeriod} ${objective.year}`}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/okrs')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to OKRs
        </Button>

        {/* OKR Header Card */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-8">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{objective.title}</h1>
                    <p className="text-slate-600 mt-1">{objective.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    {getStatusBadge(objective.confidence)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Period</p>
                    <p className="text-sm font-medium">{objective.timePeriod} {objective.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Type</p>
                    <p className="text-sm font-medium capitalize">{objective.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Last Updated</p>
                    <p className="text-sm font-medium">{formatDate(objective.updatedAt)}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={handleEditObjective}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit OKR
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/checkin?okr=${id}`)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comment
                  </Button>
                  <Button variant="destructive" className="ml-auto" onClick={() => setIsDeleteObjectiveOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="flex-shrink-0">
                <CircularProgress
                  value={objective.progress}
                  size={160}
                  strokeWidth={14}
                  status={objective.confidence as any}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Key Results ({keyResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keyResults.map((kr) => {
                const krStatus = kr.confidence === 'on-track' ? 'on-track' :
                               kr.confidence === 'at-risk' ? 'at-risk' : 'off-track';
                const isOverdue = !kr.lastCheckinAt ||
                  Math.floor((Date.now() - new Date(kr.lastCheckinAt).getTime()) / (1000 * 60 * 60 * 24)) > 7;

                return (
                  <Card
                    key={kr._id}
                    className={`transition-all cursor-pointer hover:shadow-md ${
                      selectedKR === kr._id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedKR(selectedKR === kr._id ? null : kr._id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <CircularProgress
                          value={kr.progress}
                          size={72}
                          strokeWidth={7}
                          status={krStatus}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-slate-900 mb-1">{kr.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                <span className="font-medium">
                                  {kr.currentValue} / {kr.targetValue} {kr.unit}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getTimeSinceCheckin(kr.lastCheckinAt)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isOverdue && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Update Needed
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditKR(kr);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingKR(kr);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>

                          <Progress value={kr.progress} className="h-2 mb-3" />

                          {selectedKR === kr._id && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <h5 className="text-sm font-semibold text-slate-900 mb-3">Recent Check-ins</h5>
                              <div className="space-y-3">
                                {checkIns
                                  .filter((ci) => ci.keyResultId === kr._id)
                                  .slice(0, 3)
                                  .map((checkIn) => (
                                    <div
                                      key={checkIn._id}
                                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                                    >
                                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-sm font-medium text-slate-900">
                                            {checkIn.currentValue} {kr.unit} ({checkIn.progress}%)
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">
                                              {formatDate(checkIn.submittedAt)}
                                            </span>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 w-6 p-0"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditCheckIn(checkIn);
                                              }}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 w-6 p-0"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingCheckIn(checkIn);
                                              }}
                                            >
                                              <Trash2 className="h-3 w-3 text-red-600" />
                                            </Button>
                                          </div>
                                        </div>
                                        {checkIn.statusComment && (
                                          <p className="text-sm text-slate-600">{checkIn.statusComment}</p>
                                        )}
                                        {checkIn.blockers && (
                                          <div className="mt-2 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-red-700">{checkIn.blockers}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/checkin?kr=${kr.id}`);
                                }}
                              >
                                View All Check-ins
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline - Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Activity timeline coming soon</p>
              <p className="text-sm text-slate-500 mt-1">Track all updates, comments, and changes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Objective Dialog */}
      <Dialog open={isEditObjectiveOpen} onOpenChange={setIsEditObjectiveOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Objective</DialogTitle>
            <DialogDescription>Update your objective details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editObjectiveForm.title}
                onChange={(e) =>
                  setEditObjectiveForm({ ...editObjectiveForm, title: e.target.value })
                }
                placeholder="Enter objective title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editObjectiveForm.description}
                onChange={(e) =>
                  setEditObjectiveForm({ ...editObjectiveForm, description: e.target.value })
                }
                placeholder="Describe your objective"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category (Optional)</Label>
              <Input
                id="edit-category"
                value={editObjectiveForm.category}
                onChange={(e) =>
                  setEditObjectiveForm({ ...editObjectiveForm, category: e.target.value })
                }
                placeholder="e.g., Sales, Marketing, Engineering"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditObjectiveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveObjective} disabled={updateObjective.isPending}>
              {updateObjective.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Objective Confirmation */}
      <Dialog open={isDeleteObjectiveOpen} onOpenChange={setIsDeleteObjectiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Objective</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this objective? This action cannot be undone. All key
              results and check-ins associated with this objective will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteObjectiveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteObjective}
              disabled={deleteObjective.isPending}
            >
              {deleteObjective.isPending ? 'Deleting...' : 'Delete Objective'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Key Result Dialog */}
      <Dialog open={!!editingKR} onOpenChange={(open) => !open && setEditingKR(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Key Result</DialogTitle>
            <DialogDescription>Update your key result details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-kr-title">Title</Label>
              <Input
                id="edit-kr-title"
                value={editKRForm.title}
                onChange={(e) => setEditKRForm({ ...editKRForm, title: e.target.value })}
                placeholder="Enter key result title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-kr-description">Description (Optional)</Label>
              <Textarea
                id="edit-kr-description"
                value={editKRForm.description}
                onChange={(e) => setEditKRForm({ ...editKRForm, description: e.target.value })}
                placeholder="Describe your key result"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-kr-target">Target Value</Label>
              <Input
                id="edit-kr-target"
                type="number"
                value={editKRForm.targetValue}
                onChange={(e) =>
                  setEditKRForm({ ...editKRForm, targetValue: parseFloat(e.target.value) || 0 })
                }
                placeholder="Enter target value"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingKR(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveKR} disabled={updateKeyResult.isPending}>
              {updateKeyResult.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Key Result Confirmation */}
      <Dialog open={!!deletingKR} onOpenChange={(open) => !open && setDeletingKR(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Key Result</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingKR?.title}"? This action cannot be undone.
              All check-ins for this key result will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingKR(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteKR}
              disabled={deleteKeyResult.isPending}
            >
              {deleteKeyResult.isPending ? 'Deleting...' : 'Delete Key Result'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Check-in Dialog */}
      <Dialog open={!!editingCheckIn} onOpenChange={(open) => !open && setEditingCheckIn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Check-in</DialogTitle>
            <DialogDescription>Update your check-in information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-checkin-value">Current Value</Label>
              <Input
                id="edit-checkin-value"
                type="number"
                value={editCheckInForm.currentValue}
                onChange={(e) =>
                  setEditCheckInForm({ ...editCheckInForm, currentValue: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-checkin-comment">Status Comment</Label>
              <Textarea
                id="edit-checkin-comment"
                value={editCheckInForm.statusComment}
                onChange={(e) =>
                  setEditCheckInForm({ ...editCheckInForm, statusComment: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-checkin-blockers">Blockers</Label>
              <Textarea
                id="edit-checkin-blockers"
                value={editCheckInForm.blockers}
                onChange={(e) =>
                  setEditCheckInForm({ ...editCheckInForm, blockers: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-checkin-achievements">Achievements</Label>
              <Textarea
                id="edit-checkin-achievements"
                value={editCheckInForm.achievements}
                onChange={(e) =>
                  setEditCheckInForm({ ...editCheckInForm, achievements: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCheckIn(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCheckIn} disabled={updateCheckIn.isPending}>
              {updateCheckIn.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Check-in Confirmation */}
      <Dialog open={!!deletingCheckIn} onOpenChange={(open) => !open && setDeletingCheckIn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Check-in</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this check-in? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCheckIn(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCheckIn}
              disabled={deleteCheckIn.isPending}
            >
              {deleteCheckIn.isPending ? 'Deleting...' : 'Delete Check-in'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
