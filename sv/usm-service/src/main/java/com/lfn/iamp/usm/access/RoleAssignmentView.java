package com.lfn.iamp.usm.access;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;

/**
 * Read-only projection of a {@link RoleAssignment} enriched with the
 * human-readable role name/rank — avoids making API consumers do a second
 * lookup against /api/usm/roles or /api/usm/role-names to know what the
 * roleId actually means.
 */
@Getter
@Setter
public class RoleAssignmentView {

	private Integer id;
	private Integer userId;
	private Integer roleId;
	private String roleName;
	/** Null for legacy (usm_role) assignments, which have no RBAC rank. */
	private Integer roleRank;
	/** Set only when this grant's own scope is organization-wide (project-scoped grants leave this null). */
	private Integer organizationId;
	private String organizationName;
	private Integer projectId;
	private String projectName;
	/**
	 * The organization the project itself belongs to (usm_project.organisation_id),
	 * independent of how this specific grant was scoped. Always null when
	 * projectId is null; may also be null if the project predates org assignment.
	 */
	private Integer projectOrganizationId;
	private String projectOrganizationName;
	private Instant grantedAt;
	private Instant revokedAt;

	public static RoleAssignmentView of(RoleAssignment a, String roleName, Integer roleRank,
			String organizationName, String projectName, Integer projectOrganizationId, String projectOrganizationName) {
		RoleAssignmentView v = new RoleAssignmentView();
		v.setId(a.getId());
		v.setUserId(a.getUserId());
		v.setRoleId(a.getRoleId());
		v.setRoleName(roleName);
		v.setRoleRank(roleRank);
		v.setOrganizationId(a.getOrganizationId());
		v.setOrganizationName(organizationName);
		v.setProjectId(a.getProjectId());
		v.setProjectName(projectName);
		v.setProjectOrganizationId(projectOrganizationId);
		v.setProjectOrganizationName(projectOrganizationName);
		v.setGrantedAt(a.getGrantedAt());
		v.setRevokedAt(a.getRevokedAt());
		return v;
	}
}



