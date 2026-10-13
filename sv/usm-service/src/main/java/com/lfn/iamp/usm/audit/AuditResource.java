package com.lfn.iamp.usm.audit;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

/** Backs the admin-console "Audit Log" screen. */
@RestController
@RequestMapping("/api/usm")
@Tag(name = "Audit", description = "Cross-cutting audit feed (NFR-O2)")
public class AuditResource {

	private final AuditService auditService;

	public AuditResource(AuditService auditService) {
		this.auditService = auditService;
	}

	@GetMapping("/audit")
	public ResponseEntity<List<AuditEvent>> list() {
		return ResponseEntity.ok(auditService.list());
	}
}
