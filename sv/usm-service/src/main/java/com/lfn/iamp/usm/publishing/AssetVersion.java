package com.lfn.iamp.usm.publishing;

import java.io.Serializable;
import java.time.Instant;

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
 * One row per edit. content_digest is computed once at creation and never
 * changes across gates — an org admin approves the same bytes a project
 * admin approved. §5.
 */
@Getter
@Setter
@ToString
@Entity
@Table(name = "rbac_asset_version")
public class AssetVersion implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@NotNull
	@Column(name = "asset_id")
	private Integer assetId;

	@Column(name = "environment_id")
	private Integer environmentId;

	@NotNull
	@Column(name = "version_no")
	private Integer versionNo;

	@NotNull
	@Size(max = 32)
	private String status;

	@Size(max = 255)
	@Column(name = "content_digest")
	private String contentDigest;

	@Size(max = 500)
	@Column(name = "payload_ref")
	private String payloadRef;

	@NotNull
	@Column(name = "updated_at")
	private Instant updatedAt;

	@Column(name = "creator_id")
	private Integer creatorId;
}
