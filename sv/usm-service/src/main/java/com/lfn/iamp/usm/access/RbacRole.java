package com.lfn.iamp.usm.access;

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

/**
 * A platform role with an integer rank — never compared by name.
 * See docs/RBAC_Admin_Replatform_Plan.md §2 design philosophy #2.
 */
@Getter
@Setter
@ToString
@Entity
@Table(name = "rbac_role")
public class RbacRole implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@NotNull
	@Size(max = 64)
	@Column(name = "name", unique = true)
	private String name;

	@NotNull
	@Column(name = "rank")
	private Integer rank;
}
