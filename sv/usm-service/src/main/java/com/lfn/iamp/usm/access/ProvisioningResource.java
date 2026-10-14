package com.lfn.iamp.usm.access;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.tags.Tag;

import com.lfn.iamp.usm.audit.AuditService;
import com.lfn.iamp.usm.domain.Organisation;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.repository.OrganisationRepository;
import com.lfn.iamp.usm.repository.ProjectRepository;
import com.lfn.iamp.usm.tenancy.Environment;
import com.lfn.iamp.usm.tenancy.EnvironmentRepository;

/**
 * Scoped tenancy provisioning (§3). Rank-gated creation, enforced server-side
 * (NFR-SEC2): organization = platform_admin, project = org_admin+,
 * environment = project_admin+, role = platform_admin.
 */
@RestController
@RequestMapping("/api/usm/provisioning")
@Tag(name = "Provisioning", description = "Scoped creation of org / project / environment / role")
public class ProvisioningResource {

	private static final int PROJECT_ADMIN = 2;
	private static final int ORG_ADMIN = 3;
	private static final int PLATFORM_ADMIN = 4;

	private final AccessContextService accessContextService;
	private final OrganisationRepository organisationRepository;
	private final ProjectRepository projectRepository;
	private final EnvironmentRepository environmentRepository;
	private final RbacRoleRepository rbacRoleRepository;
	private final AuditService auditService;

	public ProvisioningResource(AccessContextService accessContextService,
			OrganisationRepository organisationRepository, ProjectRepository projectRepository,
			EnvironmentRepository environmentRepository, RbacRoleRepository rbacRoleRepository,
			AuditService auditService) {
		this.accessContextService = accessContextService;
		this.organisationRepository = organisationRepository;
		this.projectRepository = projectRepository;
		this.environmentRepository = environmentRepository;
		this.rbacRoleRepository = rbacRoleRepository;
		this.auditService = auditService;
	}

	private void require(Integer actorUserId, int minRank, String action) {
		if (actorUserId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "actorUserId required");
		}
		int rank = accessContextService.highestRank(actorUserId);
		if (rank < minRank) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"Insufficient role to " + action + " (needs rank " + minRank + ", have " + rank + ")");
		}
	}

	@PostMapping("/organizations")
	public ResponseEntity<Organisation> createOrganization(@RequestParam Integer actorUserId,
			@RequestBody CreateOrgRequest req) {
		require(actorUserId, PLATFORM_ADMIN, "create an organization");
		Organisation org = new Organisation();
		org.setName(req.name());
		org.setStatus(req.status() != null ? req.status() : "active");
		org.setOnboarded(Boolean.TRUE);
		Organisation saved = organisationRepository.save(org);
		auditService.record("organisation", "created", actorUserId, "User #" + actorUserId,
				"organisation \"" + saved.getName() + "\" created");
		return ResponseEntity.ok(saved);
	}

	@PostMapping("/projects")
	public ResponseEntity<Project> createProject(@RequestParam Integer actorUserId,
			@RequestBody CreateProjectRequest req) {
		require(actorUserId, ORG_ADMIN, "create a project");
		Project p = new Project();
		p.setName(req.name());
		p.setDescription(req.description());
		p.setOrganisationId(req.organisationId());
		Project saved = projectRepository.save(p);
		auditService.record("project", "created", actorUserId, "User #" + actorUserId,
				"project \"" + saved.getName() + "\" created (org=" + req.organisationId() + ")");
		return ResponseEntity.ok(saved);
	}

	@PostMapping("/environments")
	public ResponseEntity<Environment> createEnvironment(@RequestParam Integer actorUserId,
			@RequestBody CreateEnvRequest req) {
		require(actorUserId, PROJECT_ADMIN, "create an environment");
		Environment e = new Environment();
		e.setName(req.name());
		e.setProjectId(req.projectId());
		e.setConfigRef(req.configRef());
		Environment saved = environmentRepository.save(e);
		auditService.record("environment", "created", actorUserId, "User #" + actorUserId,
				"environment \"" + saved.getName() + "\" created (project=" + req.projectId() + ")");
		return ResponseEntity.ok(saved);
	}

	@PostMapping("/roles")
	public ResponseEntity<RbacRole> createRole(@RequestParam Integer actorUserId,
			@RequestBody CreateRoleRequest req) {
		require(actorUserId, PLATFORM_ADMIN, "create a role");
		RbacRole r = new RbacRole();
		r.setName(req.name());
		r.setRank(req.rank() != null ? req.rank() : 0);
		RbacRole saved = rbacRoleRepository.save(r);
		auditService.record("rbac_role", "created", actorUserId, "User #" + actorUserId,
				"role \"" + saved.getName() + "\" (rank " + saved.getRank() + ") created");
		return ResponseEntity.ok(saved);
	}

	public record CreateOrgRequest(String name, String status) {}
	public record CreateProjectRequest(String name, String description, Integer organisationId) {}
	public record CreateEnvRequest(String name, Integer projectId, String configRef) {}
	public record CreateRoleRequest(String name, Integer rank) {}
}
