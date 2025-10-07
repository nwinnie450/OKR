import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/okr';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * RoleGuard - Component-level role-based rendering
 *
 * Conditionally renders children based on user role.
 * Useful for hiding UI elements that users don't have permission to access.
 *
 * @example
 * <RoleGuard allowedRoles={['admin']}>
 *   <Button>Delete Company OKR</Button>
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default RoleGuard;
