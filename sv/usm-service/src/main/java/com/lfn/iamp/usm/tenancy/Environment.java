package com.lfn.iamp.usm.tenancy;

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

/** Project-scoped, independent of the draft/publish state machine (§3). */
@Getter
@Setter
@ToString
@Entity
@Table(name = "rbac_environment")
public class Environment implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@NotNull
	@Column(name = "project_id")
	private Integer projectId;

	@NotNull
	@Size(max = 64)
	private String name;

	@Size(max = 500)
	@Column(name = "config_ref")
	private String configRef;
}
