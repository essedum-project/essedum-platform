package com.lfn.iamp.usm.audit;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.tags.Tag;

import com.lfn.iamp.usm.access.AccessContextService;

/** Backs the admin-console "Audit Log" screen. */
@RestController
@RequestMapping("/api/usm")
@Tag(name = "Audit", description = "Cross-cutting audit feed (NFR-O2)")
public class AuditResource {

	private static final int ORG_ADMIN = 3;

	private final AuditService auditService;
	private final AccessContextService accessContextService;

	public AuditResource(AuditService auditService, AccessContextService accessContextService) {
		this.auditService = auditService;
		this.accessContextService = accessContextService;
	}

	@GetMapping("/audit")
	public ResponseEntity<List<AuditEvent>> list(@RequestParam Integer actorUserId) {
		if (actorUserId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "actorUserId required");
		}
		int rank = accessContextService.highestRank(actorUserId);
		if (rank < ORG_ADMIN) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"Only an org admin or above may view the audit log (have rank " + rank + ")");
		}
		return ResponseEntity.ok(auditService.list());
	}
}
