package com.lfn.iamp.usm.access;

/** Body for POST /api/usm/access/role-assignments. */
public class GrantRoleRequest {

	private Integer userId;
	private Integer roleId;
	private Integer organizationId;
	private Integer projectId;
	/** The acting admin — rank-checked server-side before the grant is applied. */
	private Integer actorUserId;

	public Integer getActorUserId() {
		return actorUserId;
	}

	public void setActorUserId(Integer actorUserId) {
		this.actorUserId = actorUserId;
	}

	public Integer getUserId() {
		return userId;
	}

	public void setUserId(Integer userId) {
		this.userId = userId;
	}

	public Integer getRoleId() {
		return roleId;
	}

	public void setRoleId(Integer roleId) {
		this.roleId = roleId;
	}

	public Integer getOrganizationId() {
		return organizationId;
	}

	public void setOrganizationId(Integer organizationId) {
		this.organizationId = organizationId;
	}

	public Integer getProjectId() {
		return projectId;
	}

	public void setProjectId(Integer projectId) {
		this.projectId = projectId;
	}
}
