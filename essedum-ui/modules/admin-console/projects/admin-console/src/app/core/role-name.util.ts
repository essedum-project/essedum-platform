/** Centralized RBAC role name mapping — single source of truth. */
export class RoleNameUtil {
  private static readonly ROLE_NAME_MAP: { [key: string]: string } = {
    // Legacy DB key names (pre-rbac-17)
    'viewer': 'AI Engineer',
    'developer': 'AI Engineer',
    'project_admin': 'AI Project Admin',
    'org_admin': 'AI Organization Admin',
    'platform_admin': 'AI Platform Admin',
    // Current DB names (after rbac-17 + rbac-21 renames)
    'admin': 'AI Platform Admin',
    'organization admin': 'AI Organization Admin',
    'project admin': 'AI Project Admin',
    'ai client': 'AI Engineer',
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
