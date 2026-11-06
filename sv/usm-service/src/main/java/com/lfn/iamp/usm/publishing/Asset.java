package com.lfn.iamp.usm.publishing;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
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

	/** Populated at creation; used to enforce edit-ownership. */
	@Column(name = "created_by")
	private Integer createdBy;

	/** Display name of the creator — shown in My Drafts so engineers see who submitted. */
	@Size(max = 255)
	@Column(name = "creator_name")
	private String creatorName;

	/**
	 * Transient, computed field exposed to the frontend summarizing the asset's
	 * current publication state. Not persisted — derived from scope +
	 * currentVersionId whenever an asset is read. §4/§5.
	 */
	@Transient
	private String approvalStatus;

	/** Populates {@link #approvalStatus} from scope and currentVersionId. */
	public void deriveApprovalStatus() {
		if (currentVersionId == null) {
			this.approvalStatus = "draft";
		} else if (PromotionGate.SCOPE_PUBLIC.equals(scope)) {
			this.approvalStatus = "public";
		} else if (PromotionGate.SCOPE_ORGANIZATION.equals(scope)) {
			this.approvalStatus = "organization";
		} else if (PromotionGate.SCOPE_PROJECT.equals(scope)) {
			this.approvalStatus = "project";
		} else {
			this.approvalStatus = "published";
		}
	}
}
