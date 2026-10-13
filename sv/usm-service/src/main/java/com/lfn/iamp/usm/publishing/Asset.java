package com.lfn.iamp.usm.publishing;

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

/** scope answers "who can see this" — project/organization/public. §3. */
@Getter
@Setter
@ToString
@Entity
@Table(name = "rbac_asset")
public class Asset implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@NotNull
	@Column(name = "project_id")
	private Integer projectId;

	@NotNull
	@Size(max = 64)
	@Column(name = "asset_type")
	private String assetType;

	@NotNull
	@Size(max = 255)
	private String name;

	@NotNull
	@Size(max = 32)
	private String scope;

	@Column(name = "current_version_id")
	private Integer currentVersionId;
}
