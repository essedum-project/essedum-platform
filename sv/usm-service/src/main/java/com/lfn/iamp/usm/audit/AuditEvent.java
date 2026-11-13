package com.lfn.iamp.usm.audit;

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
 * Cross-cutting audit feed (NFR-O2) — every write to role_assignment,
 * promotion_event, and menu_item emits one of these. Append-only, same
 * philosophy as PromotionEvent (§3 design decision #3).
 */
@Getter
@Setter
@ToString
@Entity
@Table(name = "rbac_audit_event")
public class AuditEvent implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@NotNull
	@Size(max = 64)
	@Column(name = "correlation_id")
	private String correlationId;

	@NotNull
	@Size(max = 64)
	private String entity;

	@NotNull
	@Size(max = 64)
	private String action;

	@Column(name = "actor_id")
	private Integer actorId;

	@Size(max = 255)
	@Column(name = "actor_name")
	private String actorName;

	@NotNull
	@Column(name = "occurred_at")
	private Instant occurredAt;

	@Size(max = 1000)
	private String details;
}
