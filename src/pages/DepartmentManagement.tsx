import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Building2, Plus, Pencil, Trash2, Loader2, User, Search, X, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Department } from '@/lib/api/departments';
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@/hooks/useDepartments';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';

export default function DepartmentManagement() {
  const { toast } = useToast();

  // API hooks
  const { data: departments, isLoading, error } = useDepartments();
  const { data: users } = useUsers();
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();

  // Safe array for rendering
  const departmentsList = departments || [];
  const usersList = users || [];

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'teams'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered and sorted departments
  const filteredDepartments = departmentsList
    .filter(dept => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          dept.name.toLowerCase().includes(query) ||
          dept.code.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'code') {
        comparison = a.code.localeCompare(b.code);
      } else if (sortBy === 'teams') {
        const aTeams = (a as any).teamCount || 0;
        const bTeams = (b as any).teamCount || 0;
        comparison = aTeams - bTeams;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const activeFilterCount = (searchQuery ? 1 : 0);

  const handleAddDepartment = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      headOfDepartment: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || '',
      headOfDepartment: department.headOfDepartment?._id || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const confirmAddDepartment = async () => {
    try {
      await createDepartmentMutation.mutateAsync({
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description || undefined,
        headOfDepartment: formData.headOfDepartment || undefined,
      });

      toast({
        title: 'Success',
        description: 'Department created successfully',
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        headOfDepartment: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create department',
        variant: 'destructive',
      });
    }
  };

  const confirmEditDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      await updateDepartmentMutation.mutateAsync({
        id: selectedDepartment._id,
        data: {
          name: formData.name,
          code: formData.code.toUpperCase(),
          description: formData.description || undefined,
          headOfDepartment: formData.headOfDepartment || null,
        },
      });

      toast({
        title: 'Success',
        description: 'Department updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update department',
        variant: 'destructive',
      });
    }
  };

  const confirmDeleteDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      await deleteDepartmentMutation.mutateAsync(selectedDepartment._id);

      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete department',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout
        title="Department Management"
        description="Manage company departments and organizational structure"
      >
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout
        title="Department Management"
        description="Manage company departments and organizational structure"
      >
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-red-600">Error loading departments: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Department Management"
      description="Manage company departments and organizational structure"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                All Departments
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Create and manage departments for your organization
              </CardDescription>
            </div>
            <Button onClick={handleAddDepartment} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value: 'name' | 'code' | 'teams') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="code">Sort by Code</SelectItem>
                <SelectItem value="teams">Sort by Teams</SelectItem>
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

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Head of Department</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {searchQuery ? 'No departments match your search.' : 'No departments found. Click "Add Department" to create one.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((department) => (
                    <TableRow key={department._id}>
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {department.code}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {department.description || '-'}
                      </TableCell>
                      <TableCell>
                        {department.headOfDepartment ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{department.headOfDepartment.name}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{formatDate(department.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDepartment(department)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDepartment(department)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Create a new department for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-visible">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Department Name</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Engineering"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-code">Department Code</Label>
              <Input
                id="add-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., ENG"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Short code for the department (will be converted to uppercase)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-description">Description (Optional)</Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the department"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-head">Head of Department (Optional)</Label>
              <Select
                value={formData.headOfDepartment}
                onValueChange={(value) => setFormData({ ...formData, headOfDepartment: value })}
              >
                <SelectTrigger id="add-head">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {usersList.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAddDepartment}
              disabled={!formData.name || !formData.code || createDepartmentMutation.isPending}
            >
              {createDepartmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Department'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information and assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-visible">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Department Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-code">Department Code</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                maxLength={10}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-head">Head of Department (Optional)</Label>
              <Select
                value={formData.headOfDepartment}
                onValueChange={(value) => setFormData({ ...formData, headOfDepartment: value })}
              >
                <SelectTrigger id="edit-head">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {usersList.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmEditDepartment}
              disabled={!formData.name || !formData.code || updateDepartmentMutation.isPending}
            >
              {updateDepartmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Department'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the department "{selectedDepartment?.name}". This action cannot be
              undone. Users assigned to this department will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDepartment}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteDepartmentMutation.isPending}
            >
              {deleteDepartmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Department'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
