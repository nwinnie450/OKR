import React from 'react';
import { Home, Target, Users, BarChart3, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/okr';

export interface NavigationProps {
  userRole: UserRole;
  activeRoute: string;
  userName?: string;
  userAvatar?: string;
  onNavigate?: (route: string) => void;
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  route: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    route: '/',
    roles: ['admin', 'manager', 'member'],
  },
  {
    id: 'okrs',
    label: 'OKRs',
    icon: Target,
    route: '/okrs',
    roles: ['admin', 'manager', 'member'],
  },
  {
    id: 'teams',
    label: 'Teams',
    icon: Users,
    route: '/teams',
    roles: ['admin', 'manager'],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    route: '/reports',
    roles: ['admin', 'manager'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    route: '/settings',
    roles: ['admin', 'manager', 'member'],
  },
];

/**
 * Navigation component provides role-based navigation menu.
 *
 * Desktop: Sidebar (240px width) with logo, menu items, and user profile
 * Mobile: Bottom navigation bar (56px height)
 *
 * Features:
 * - Role-based menu filtering
 * - Active route highlighting
 * - Keyboard navigation support
 * - Responsive breakpoints
 *
 * @example
 * <Navigation
 *   userRole="manager"
 *   activeRoute="/okrs"
 *   userName="Sarah Chen"
 *   onNavigate={handleNavigate}
 * />
 */
export function Navigation({
  userRole,
  activeRoute,
  userName = 'User',
  userAvatar,
  onNavigate,
  className,
}: NavigationProps) {
  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleItemClick = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    }
  };

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col',
          'fixed left-0 top-0 bottom-0',
          'w-60', // 240px
          'bg-white',
          'border-r border-slate-200',
          'z-30',
          className
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Target size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">OKR System</span>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1" role="menu">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.route;

              return (
                <li key={item.id} role="none">
                  <button
                    onClick={() => handleItemClick(item.route)}
                    className={cn(
                      'w-full flex items-center gap-3',
                      'px-3 py-2.5',
                      'text-sm font-medium',
                      'rounded-md',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={20} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="px-3 py-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User size={16} className="text-slate-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-slate-500 capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className={cn(
          'lg:hidden',
          'fixed bottom-0 left-0 right-0',
          'h-14', // 56px
          'bg-white',
          'border-t border-slate-200',
          'z-40',
          'safe-area-inset-bottom',
          className
        )}
      >
        <ul className="flex items-center justify-around h-full px-2" role="menu">
          {visibleMenuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.route;

            return (
              <li key={item.id} role="none" className="flex-1">
                <button
                  onClick={() => handleItemClick(item.route)}
                  className={cn(
                    'w-full flex flex-col items-center justify-center gap-0.5',
                    'py-1.5',
                    'text-xs font-medium',
                    'transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                    isActive
                      ? 'text-blue-600'
                      : 'text-slate-600 active:text-slate-900'
                  )}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                >
                  <Icon
                    size={24}
                    aria-hidden="true"
                    className={isActive ? 'stroke-[2.5]' : ''}
                  />
                  <span className="mt-0.5">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
