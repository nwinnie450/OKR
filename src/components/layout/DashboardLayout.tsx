import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Users, User, LogOut, UserCog, ChevronDown, BarChart3, UsersRound, Target, Home, ListTodo, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

/**
 * DashboardLayout - Wraps all dashboard pages with navigation
 * Provides role switcher for easy navigation between Admin/Manager/Member views
 */
export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation menu items based on role
  const getMenuItems = () => {
    const baseItems = [
      {
        path: user?.role === 'admin' ? '/admin' : user?.role === 'manager' ? '/manager' : '/member',
        label: 'Dashboard',
        icon: Home,
        roles: ['admin', 'manager', 'team_lead', 'member', 'viewer'],
      },
      {
        path: '/okrs',
        label: 'All OKRs',
        icon: ListTodo,
        roles: ['admin', 'manager', 'team_lead', 'member', 'viewer'],
      },
    ];

    const adminItems = [
      {
        path: '/users',
        label: 'People',
        icon: UserCog,
        roles: ['admin'],
      },
      {
        path: '/departments',
        label: 'Departments',
        icon: Building2,
        roles: ['admin'],
      },
      {
        path: '/teams',
        label: 'Teams',
        icon: UsersRound,
        roles: ['admin'],
      },
      {
        path: '/activity',
        label: 'Activity',
        icon: Activity,
        roles: ['admin'],
      },
      {
        path: '/reports',
        label: 'Reports',
        icon: BarChart3,
        roles: ['admin'],
      },
    ];

    const managerItems = [
      {
        path: '/users',
        label: 'People',
        icon: UserCog,
        roles: ['admin', 'manager'],
      },
      {
        path: '/teams',
        label: 'Teams',
        icon: UsersRound,
        roles: ['admin', 'manager'],
      },
      {
        path: '/activity',
        label: 'Activity',
        icon: Activity,
        roles: ['admin', 'manager'],
      },
    ];

    const teamLeadItems = [
      {
        path: '/users',
        label: 'My Team',
        icon: Users,
        roles: ['admin', 'manager', 'team_lead'],
      },
      {
        path: '/activity',
        label: 'Activity',
        icon: Activity,
        roles: ['admin', 'manager', 'team_lead'],
      },
    ];

    if (user?.role === 'admin') return [...baseItems, ...adminItems];
    if (user?.role === 'manager') return [...baseItems, ...managerItems];
    if (user?.role === 'team_lead') return [...baseItems, ...teamLeadItems];
    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
                O
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">OKR System</h1>
                <p className="text-xs text-slate-500">Q4 2025</p>
              </div>
            </div>

            {/* Main Navigation Menu */}
            <nav className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path ||
                  (item.path.includes('admin') && currentPath === '/admin') ||
                  (item.path.includes('manager') && currentPath === '/manager') ||
                  (item.path.includes('member') && currentPath === '/member');

                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "gap-2 transition-all",
                      isActive && "bg-blue-50 text-blue-600 font-medium"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/okr/new')}
                className="hidden lg:flex gap-2"
              >
                <Target className="h-4 w-4" />
                New OKR
              </Button>

              {/* Notifications Bell */}
              <NotificationBell />

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-sm font-medium">{user?.name || 'User'}</span>
                      <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        Role: {user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-2 text-slate-600">{description}</p>
          )}
        </div>

        {/* Page Content */}
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
        <div className="grid grid-cols-5 gap-0.5 p-2">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path ||
              (item.path.includes('admin') && currentPath === '/admin') ||
              (item.path.includes('manager') && currentPath === '/manager') ||
              (item.path.includes('member') && currentPath === '/member');

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg p-2 transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

export default DashboardLayout;
