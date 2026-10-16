package com.lfn.iamp.usm.access;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.tags.Tag;

import com.lfn.iamp.usm.audit.AuditService;
import com.lfn.iamp.usm.domain.DashConstant;
import com.lfn.iamp.usm.domain.Organisation;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.UsmPortfolio;
import com.lfn.iamp.usm.repository.DashConstantRepository;
import com.lfn.iamp.usm.repository.OrganisationRepository;
import com.lfn.iamp.usm.repository.ProjectRepository;
import com.lfn.iamp.usm.repository.UserProjectRoleRepository;
import com.lfn.iamp.usm.repository.UsmPortfolioRepository;
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

	/** The four system roles every project gets a sidebar for (rbac-20). */
	private static final String[] ADMIN_SIDE_KEYS = { "Platform Admin Side", "Organization Admin Side", "Project Admin Side" };
	private static final String DEVELOPER_SIDE_KEY = "Developer Side";
	/** Developer menus are seeded as a one-time copy of this legacy role's. */
	private static final String DEVELOPER_TEMPLATE_KEY = "IT Portfolio Manager Side";
	private static final String DASHBOARD_ITEM = "{\"label\":\"Dashboard\",\"icon\":\"tachometer\",\"url\":\"./dashboard\",\"children\":[]}";
	private static final String ADMIN_CONSOLE_ITEM = "{\"label\":\"Admin Console\",\"icon\":\"shield\",\"url\":\"./admin-console\",\"children\":[]}";

	private final AccessContextService accessContextService;
	private final OrganisationRepository organisationRepository;
	private final ProjectRepository projectRepository;
	private final EnvironmentRepository environmentRepository;
	private final RbacRoleRepository rbacRoleRepository;
	private final AuditService auditService;
	private final UsmPortfolioRepository usmPortfolioRepository;
	private final RoleAssignmentRepository roleAssignmentRepository;
	private final UserProjectRoleRepository userProjectRoleRepository;
	private final DashConstantRepository dashConstantRepository;

	public ProvisioningResource(AccessContextService accessContextService,
			OrganisationRepository organisationRepository, ProjectRepository projectRepository,
			EnvironmentRepository environmentRepository, RbacRoleRepository rbacRoleRepository,
			AuditService auditService, UsmPortfolioRepository usmPortfolioRepository,
			RoleAssignmentRepository roleAssignmentRepository, UserProjectRoleRepository userProjectRoleRepository,
			DashConstantRepository dashConstantRepository) {
		this.accessContextService = accessContextService;
		this.organisationRepository = organisationRepository;
		this.projectRepository = projectRepository;
		this.environmentRepository = environmentRepository;
		this.rbacRoleRepository = rbacRoleRepository;
		this.auditService = auditService;
		this.usmPortfolioRepository = usmPortfolioRepository;
		this.roleAssignmentRepository = roleAssignmentRepository;
		this.userProjectRoleRepository = userProjectRoleRepository;
		this.dashConstantRepository = dashConstantRepository;
	}

	/**
	 * Gives a brand-new project the same baseline sidebars rbac-20 seeded for
	 * existing ones, so a freshly provisioned project is never a blank slate.
	 */
	private void seedDefaultRoleMenus(String projectName) {
		for (String key : ADMIN_SIDE_KEYS) {
			saveRoleMenuItem(key, projectName, DASHBOARD_ITEM);
			saveRoleMenuItem(key, projectName, ADMIN_CONSOLE_ITEM);
		}
		List<String> templateValues = dashConstantRepository.findDistinctProjectsForItem(DEVELOPER_TEMPLATE_KEY)
				.stream()
				.filter(p -> p != null && !p.isBlank())
				.findFirst()
				.map(p -> dashConstantRepository.findAllDashConstantsbyItemAndProject(DEVELOPER_TEMPLATE_KEY, p).stream()
						.filter(c -> DEVELOPER_TEMPLATE_KEY.equals(c.getKeys()))
						.map(DashConstant::getValue)
						.collect(Collectors.toList()))
				.orElseGet(java.util.Collections::emptyList);
		if (templateValues.isEmpty()) {
			saveRoleMenuItem(DEVELOPER_SIDE_KEY, projectName, DASHBOARD_ITEM);
		} else {
			templateValues.forEach(v -> saveRoleMenuItem(DEVELOPER_SIDE_KEY, projectName, v));
		}
	}

	private void saveRoleMenuItem(String key, String projectName, String itemValue) {
		DashConstant c = new DashConstant();
		c.setKeys(key);
		c.setProject_name(projectName);
		c.setValue(itemValue);
		dashConstantRepository.save(c);
	}

	/**
	 * Every project needs a legacy usm_portfolio link (usm_user_project_role.
	 * portfolio_id is NOT NULL) for the RBAC→legacy bridge and the shell's
	 * header switcher to work. New orgs/projects have no such link by default
	 * (portfolios were replaced by organisations) — find-or-create one by name.
	 */
	private UsmPortfolio findOrCreatePortfolio(String name) {
		return usmPortfolioRepository.findAll().stream()
				.filter(p -> name.equals(p.getPortfolioName()))
				.findFirst()
				.orElseGet(() -> {
					UsmPortfolio p = new UsmPortfolio();
					p.setPortfolioName(name);
					return usmPortfolioRepository.save(p);
				});
	}

	private int require(Integer actorUserId, int minRank, String action) {
		if (actorUserId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "actorUserId required");
		}
		int rank = accessContextService.highestRank(actorUserId);
		if (rank < minRank) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"Insufficient role to " + action + " (needs rank " + minRank + ", have " + rank + ")");
		}
		return rank;
	}

	/** Non-platform_admin callers must have the organization within their own reach. */
	private void requireOrgReach(Integer actorUserId, int actorRank, Integer organisationId, String action) {
		if (actorRank >= PLATFORM_ADMIN || organisationId == null) {
			return;
		}
		if (!accessContextService.resolve(actorUserId).getReachableOrganizationIds().contains(organisationId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot " + action + " outside your own organization");
		}
	}

	/** Non-platform_admin callers must have the project within their own reach. */
	private void requireProjectReach(Integer actorUserId, int actorRank, Integer projectId, String action) {
		if (actorRank >= PLATFORM_ADMIN || projectId == null) {
			return;
		}
		if (!accessContextService.resolve(actorUserId).getReachableProjectIds().contains(projectId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot " + action + " outside your own projects");
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
		Organisation saved;
		try {
			saved = organisationRepository.save(org);
		} catch (DataIntegrityViolationException e) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"An organization named \"" + req.name() + "\" already exists");
		}
		findOrCreatePortfolio(saved.getName());
		auditService.record("organisation", "created", actorUserId, "User #" + actorUserId,
				"organisation \"" + saved.getName() + "\" created");
		return ResponseEntity.ok(saved);
	}

	@PostMapping("/projects")
	public ResponseEntity<Project> createProject(@RequestParam Integer actorUserId,
			@RequestBody CreateProjectRequest req) {
		int rank = require(actorUserId, ORG_ADMIN, "create a project");
		requireOrgReach(actorUserId, rank, req.organisationId(), "create a project");
		Project p = new Project();
		p.setName(req.name());
		// project_display_name is NOT NULL in usm_project — default it to the name.
		p.setProjectdisplayname(req.name());
		p.setDescription(req.description());
		p.setOrganisationId(req.organisationId());
		organisationRepository.findById(req.organisationId())
				.ifPresent(org -> p.setPortfolioId(findOrCreatePortfolio(org.getName())));
		Project saved;
		try {
			saved = projectRepository.save(p);
		} catch (DataIntegrityViolationException e) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"A project named \"" + req.name() + "\" already exists");
		}
		auditService.record("project", "created", actorUserId, "User #" + actorUserId,
				"project \"" + saved.getName() + "\" created (org=" + req.organisationId() + ")");
		seedDefaultRoleMenus(saved.getName());
		return ResponseEntity.ok(saved);
	}

	@DeleteMapping("/organizations/{id}")
	public ResponseEntity<Void> deleteOrganization(@PathVariable Integer id, @RequestParam Integer actorUserId) {
		require(actorUserId, PLATFORM_ADMIN, "delete an organization");
		// Cascade: its projects (and their role mappings) go with it. Org-scoped
		// role assignments (no specific project) are cleared too.
		List<Project> orgProjects = projectRepository.findAll().stream()
				.filter(p -> id.equals(p.getOrganisationId()))
				.collect(Collectors.toList());
		for (Project p : orgProjects) {
			deleteProjectCascade(p.getId());
		}
		roleAssignmentRepository.findAll().stream()
				.filter(a -> id.equals(a.getOrganizationId()))
				.forEach(roleAssignmentRepository::delete);
		try {
			organisationRepository.deleteById(id);
		} catch (DataIntegrityViolationException e) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"This organization is still referenced elsewhere and cannot be deleted");
		}
		auditService.record("organisation", "deleted", actorUserId, "User #" + actorUserId,
				"organisation #" + id + " deleted (cascaded " + orgProjects.size() + " project(s))");
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/projects/{id}")
	public ResponseEntity<Void> deleteProject(@PathVariable Integer id, @RequestParam Integer actorUserId) {
		int rank = require(actorUserId, ORG_ADMIN, "delete a project");
		requireProjectReach(actorUserId, rank, id, "delete a project");
		deleteProjectCascade(id);
		auditService.record("project", "deleted", actorUserId, "User #" + actorUserId, "project #" + id + " deleted");
		return ResponseEntity.noContent().build();
	}

	/** Clears a project's role mappings (both RBAC and legacy) before deleting it. */
	private void deleteProjectCascade(Integer projectId) {
		roleAssignmentRepository.findAll().stream()
				.filter(a -> projectId.equals(a.getProjectId()))
				.forEach(roleAssignmentRepository::delete);
		try {
			userProjectRoleRepository.findByProjectIdId(projectId).forEach(userProjectRoleRepository::delete);
		} catch (java.sql.SQLException e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"Failed to clear legacy role mappings for project #" + projectId);
		}
		try {
			projectRepository.deleteById(projectId);
		} catch (DataIntegrityViolationException e) {
			// usm_project is FK-referenced from many legacy modules (datasets,
			// pipelines, surveys, etc.) — report instead of forcing a wider cascade.
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Project #" + projectId + " still has dependent data (pipelines, datasets, environments, etc.) and cannot be deleted");
		}
	}

	@PostMapping("/environments")
	public ResponseEntity<Environment> createEnvironment(@RequestParam Integer actorUserId,
			@RequestBody CreateEnvRequest req) {
		int rank = require(actorUserId, PROJECT_ADMIN, "create an environment");
		requireProjectReach(actorUserId, rank, req.projectId(), "create an environment");
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
		int actorRank = require(actorUserId, PLATFORM_ADMIN, "create a role");
		int rank = req.rank() != null ? req.rank() : 0;
		if (rank < 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rank cannot be negative");
		}
		if (rank > actorRank) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"Cannot create a role ranked above your own (rank " + rank + ", have " + actorRank + ")");
		}
		RbacRole r = new RbacRole();
		r.setName(req.name());
		r.setRank(rank);
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
