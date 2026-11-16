package com.lfn.iamp.usm.access;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Unified role representation combining both RBAC (rbac_role) and legacy USM
 * (usm_role) roles. Allows clients to display both role systems in a single
 * dropdown without breaking existing API contracts.
 * 
 * Fields:
 * - id: Unique identifier (from respective table)
 * - name: Role name (e.g., "IT Portfolio Manager", "developer", "Admin")
 * - rank: Rank (RBAC only, nullable for legacy roles)
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UnifiedRole implements Serializable {

	private static final long serialVersionUID = 1L;

	private Integer id;
	private String name;
	private Integer rank; // nullable for legacy roles

	public UnifiedRole(Integer id, String name) {
		this.id = id;
		this.name = name;
		this.rank = null;
	}
}
