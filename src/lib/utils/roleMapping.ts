import type { UserRole } from '@/lib/api/auth';

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: 'Administrator',
  pm: 'Product Manager',
  ba: 'Business Analyst',
  dev: 'Developer',
  qa: 'QA Engineer',
  support: 'Support Specialist',
  hr: 'HR Specialist',
  finance: 'Finance Specialist',
  manager: 'Manager',
  member: 'Member',
};

/**
 * Get the full display name for a user role
 * @param role - The user role code
 * @returns The full display name
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role] || role;
}

/**
 * Get the short code for a role display name
 * @param displayName - The full role display name
 * @returns The role code or undefined if not found
 */
export function getRoleCode(displayName: string): UserRole | undefined {
  const entry = Object.entries(ROLE_DISPLAY_NAMES).find(
    ([_, name]) => name === displayName
  );
  return entry ? (entry[0] as UserRole) : undefined;
}
