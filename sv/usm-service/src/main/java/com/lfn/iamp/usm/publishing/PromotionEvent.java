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
 * Append-only — the current state of a gate is the latest event for
 * (asset_version_id, gate); the full history is the table itself. §3/§6.
 */
@Getter
@Setter
@ToString
@Entity
@Table(name = "rbac_promotion_event")
public class PromotionEvent implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@NotNull
	@Column(name = "asset_version_id")
	private Integer assetVersionId;

	@NotNull
	@Size(max = 32)
	private String gate;

	@NotNull
	@Size(max = 32)
	private String action;

	@NotNull
	@Column(name = "actor_id")
	private Integer actorId;

	@Size(max = 255)
	@Column(name = "actor_name")
	private String actorName;

	@Size(max = 1000)
	private String note;

	@NotNull
	@Column(name = "occurred_at")
	private Instant occurredAt;
}
