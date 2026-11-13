package com.lfn.iamp.usm.access;

import java.io.Serializable;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Grants a role to a user, scoped to exactly one of organization/project, or
 * neither for a platform-wide grant. See §3 — one table, not per-scope tables.
 */
@Getter
@Setter
@ToString
@Entity
@Table(name = "rbac_role_assignment")
public class RoleAssignment implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@NotNull
	@Column(name = "user_id")
	private Integer userId;

	@NotNull
	@Column(name = "role_id")
	private Integer roleId;

	@Column(name = "organization_id")
	private Integer organizationId;

	@Column(name = "project_id")
	private Integer projectId;

	@NotNull
	@Column(name = "granted_at")
	private Instant grantedAt;

	@Column(name = "revoked_at")
	private Instant revokedAt;
}
