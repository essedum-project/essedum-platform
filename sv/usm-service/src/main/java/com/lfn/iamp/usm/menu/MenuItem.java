package com.lfn.iamp.usm.menu;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/** Drives MenuService.menuFor() — no `if (role.name == "X")` chains. §7. */
@Getter
@Setter
@ToString
@Entity
@Table(name = "rbac_menu_item")
public class MenuItem implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "parent_id")
	private Integer parentId;

	@NotNull
	@Size(max = 255)
	private String label;

	@NotNull
	@Size(max = 255)
	private String route;

	@NotNull
	@Column(name = "min_role_rank")
	private Integer minRoleRank;

	// ADDED — nullable; null means no upper bound
	@Column(name = "max_role_rank")
	private Integer maxRoleRank;

	@NotNull
	@Column(name = "display_order")
	private Integer displayOrder;

	/** Optional sidebar icon name (Font-Awesome), e.g. "tachometer". */
	@Size(max = 64)
	private String icon;

	/**
	 * Optional role-override (§7 "rank-based + role override"): a comma-separated
	 * list of role names this item is scoped to. When blank the item follows the
	 * rank-based default (min_role_rank); when set it is additionally surfaced to
	 * users acting in one of these roles regardless of rank.
	 */
	@Size(max = 512)
	private String roles;

	/**
	 * Optional project scope (project_name). Legacy per-role menus differ per
	 * project, so migrated role-override items carry the project they belong to;
	 * blank = applies to every project.
	 */
	@Size(max = 255)
	private String project;
}
