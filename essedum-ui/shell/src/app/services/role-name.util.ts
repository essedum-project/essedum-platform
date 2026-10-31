/** Centralized RBAC role name mapping — single source of truth across shell and admin-console. */
export class RoleNameUtil {
  private static readonly ROLE_NAME_MAP: { [key: string]: string } = {
    'ai client': 'AI Engineer',
    'viewer': 'AI Engineer',
    'developer': 'AI Engineer',
    'project admin': 'AI Project Admin',
    'project_admin': 'AI Project Admin',
    'organization admin': 'AI Organisation Admin',
    'org_admin': 'AI Organisation Admin',
    'admin': 'AI Platform Admin',
    'platform_admin': 'AI Platform Admin',
  };

  private static readonly RANK_LABEL_MAP: { [key: number]: string } = {
    0: 'AI Engineer',
    1: 'AI Engineer',
    2: 'AI Project Admin',
    3: 'AI Organization Admin',
    4: 'AI Platform Admin',
  };

  /**
   * Get display name for a role by name (e.g., 'developer' → 'AI Engineer').
   * Returns original name if not found in the map.
   */
  static getDisplayNameByRoleName(roleName: string): string {
    return this.ROLE_NAME_MAP[roleName?.toLowerCase()] || roleName;
  }

  /**
   * Get display name for a role by rank (e.g., 1 → 'AI Engineer').
   * Returns 'Legacy' for null/undefined, 'Rank X' for unknown ranks.
   */
  static getDisplayNameByRank(rank: number | null | undefined): string {
    if (rank == null) return 'Legacy';
    return this.RANK_LABEL_MAP[rank] ?? `Rank ${rank}`;
  }

  /**
   * Get color for a role by rank.
   */
  static getRankColor(rank: number | null | undefined): string {
    if (rank == null) return '#9c27b0'; // Legacy: purple
    const colorMap: { [key: number]: string } = {
      0: '#607d8b', // AI Client: blue-gray
      1: '#1976d2', // AI Engineer: blue
      2: '#388e3c', // AI Project Admin: green
      3: '#f57c00', // AI Organization Admin: orange
      4: '#7b1fa2', // AI Platform Admin: deep purple
    };
    return colorMap[rank] ?? '#607d8b';
  }
}
