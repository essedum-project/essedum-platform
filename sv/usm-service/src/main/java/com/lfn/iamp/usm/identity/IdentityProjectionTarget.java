package com.lfn.iamp.usm.identity;

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

/** One outbox row per (project, external system) — the §8 "to-do list". */
@Getter
@Setter
@ToString
@Entity
@Table(name = "rbac_identity_projection_target")
public class IdentityProjectionTarget implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@NotNull
	@Column(name = "project_id")
	private Integer projectId;

	@NotNull
	@Size(max = 32)
	@Column(name = "target_type")
	private String targetType;

	@Size(max = 255)
	@Column(name = "external_ref")
	private String externalRef;

	@NotNull
	@Size(max = 32)
	@Column(name = "sync_status")
	private String syncStatus;

	@Column(name = "last_attempt_at")
	private Instant lastAttemptAt;
}
