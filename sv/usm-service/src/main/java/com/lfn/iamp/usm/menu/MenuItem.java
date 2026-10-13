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

	@NotNull
	@Column(name = "display_order")
	private Integer displayOrder;
}
