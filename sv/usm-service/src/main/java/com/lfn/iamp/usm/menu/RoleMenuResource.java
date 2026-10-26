package com.lfn.iamp.usm.menu;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.lfn.iamp.usm.access.AccessContextService;
import com.lfn.iamp.usm.audit.AuditService;
import com.lfn.iamp.usm.domain.DashConstant;
import com.lfn.iamp.usm.repository.DashConstantRepository;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Menu Configuration's bridge to the LIVE non-admin sidebars. Those render
 * straight from usm_constant rows keyed "&lt;Role&gt; Side" (one row per
 * top-level item, item_value = JSON). Reading/writing them here means Menu
 * Configuration stays in sync with what each role actually sees, and an edit
 * shows up on the sidebar with no migration or second source of truth.
 */
@RestController
@RequestMapping("/api/usm")
@Tag(name = "Role Menus", description = "Edit the live per-role sidebar menus (usm_constant)")
public class RoleMenuResource {

	private static final String SIDE_SUFFIX = " Side";
	private static final int PLATFORM_ADMIN = 4;

	private final DashConstantRepository dashConstantRepository;
	private final AuditService auditService;
	private final AccessContextService accessContextService;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public RoleMenuResource(DashConstantRepository dashConstantRepository, AuditService auditService,
			AccessContextService accessContextService) {
		this.dashConstantRepository = dashConstantRepository;
		this.auditService = auditService;
		this.accessContextService = accessContextService;
	}

	private void requirePlatformAdmin(Integer actorUserId) {
		if (actorUserId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "actorUserId required");
		}
		int rank = accessContextService.highestRank(actorUserId);
		if (rank < PLATFORM_ADMIN) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"Only a platform admin may manage menu configuration (have rank " + rank + ")");
		}
	}

	/** Distinct role names that have a sidebar menu (e.g. "IT Portfolio Manager"). */
	@GetMapping("/role-menus/roles")
	public ResponseEntity<List<String>> roles(@RequestParam Integer actorUserId) {
		requirePlatformAdmin(actorUserId);
		List<String> roles = dashConstantRepository.findDistinctSideItems().stream()
				.filter(k -> k != null && k.endsWith(SIDE_SUFFIX))
				.map(k -> k.substring(0, k.length() - SIDE_SUFFIX.length()).trim())
				.distinct()
				.sorted()
				.collect(Collectors.toList());
		return ResponseEntity.ok(roles);
	}

	/** Projects a given role's menu is configured for. */
	@GetMapping("/role-menus/projects")
	public ResponseEntity<List<String>> projects(@RequestParam String role, @RequestParam Integer actorUserId) {
		requirePlatformAdmin(actorUserId);
		List<String> projects = dashConstantRepository.findDistinctProjectsForItem(role + SIDE_SUFFIX).stream()
				.filter(p -> p != null && !p.isBlank())
				.distinct()
				.sorted()
				.collect(Collectors.toList());
		return ResponseEntity.ok(projects);
	}

	/** The top-level sidebar items for a role in a project (global — shared by all users with that role+project). */
	@GetMapping("/role-menus")
	public ResponseEntity<List<RoleMenuDto>> list(@RequestParam String role, @RequestParam String project,
			@RequestParam Integer actorUserId) {
		requirePlatformAdmin(actorUserId);
		List<RoleMenuDto> rows = new ArrayList<>();
		for (DashConstant dc : dashConstantRepository.findAllDashConstantsbyItemAndProject(
				role + SIDE_SUFFIX, project)) {
			rows.add(toDto(dc, role));
		}
		return ResponseEntity.ok(rows);
	}

	/** Edit a top-level item in place; children in the JSON are preserved. */
	@PutMapping("/role-menus/{id}")
	public ResponseEntity<RoleMenuDto> update(@PathVariable Integer id, @RequestParam Integer actorUserId,
			@RequestBody RoleMenuDto body) {
		requirePlatformAdmin(actorUserId);
		DashConstant dc = dashConstantRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("No such menu item: " + id));
		ObjectNode node = readValue(dc.getValue());
		node.put("label", body.getLabel());
		node.put("icon", body.getIcon() == null ? "" : body.getIcon());
		node.put("url", body.getUrl() == null ? "" : body.getUrl());
		dc.setValue(writeValue(node));
		dashConstantRepository.save(dc);
		auditService.record("role_menu", "edited", null, null,
				"menu '" + body.getLabel() + "' updated for " + dc.getKeys() + " / " + dc.getProject_name());
		return ResponseEntity.ok(toDto(dc, stripSide(dc.getKeys())));
	}

	/** Add a new top-level item globally for a role+project (affects all users with that role+project). */
	@PostMapping("/role-menus")
	public ResponseEntity<RoleMenuDto> create(@RequestParam Integer actorUserId, @RequestBody RoleMenuDto body) {
		requirePlatformAdmin(actorUserId);
		String item = body.getRole() + SIDE_SUFFIX;
		DashConstant dc = new DashConstant();
		dc.setKeys(item);
		dc.setProject_name(body.getProject());
		// Clone project_id / portfolio_id from a global sibling (no userId filter).
		List<DashConstant> siblings = dashConstantRepository.findAllDashConstantsbyItemAndProject(item,
				body.getProject());
		if (!siblings.isEmpty()) {
			dc.setProject_id(siblings.get(0).getProject_id());
			dc.setPortfolio_id(siblings.get(0).getPortfolio_id());
		}
		ObjectNode node = objectMapper.createObjectNode();
		node.put("label", body.getLabel());
		node.put("icon", body.getIcon() == null ? "" : body.getIcon());
		node.put("url", body.getUrl() == null ? "" : body.getUrl());
		// Preserve children from request so navigation works for items whose real
		// URL lives inside a child node (e.g. Datasets → first child URL).
		if (body.getChildren() != null && !body.getChildren().isEmpty()) {
			node.set("children", objectMapper.valueToTree(body.getChildren()));
		} else {
			node.set("children", objectMapper.createArrayNode());
		}
		dc.setValue(writeValue(node));
		DashConstant saved = dashConstantRepository.save(dc);
		auditService.record("role_menu", "created", actorUserId, "User #" + actorUserId,
				"menu '" + body.getLabel() + "' added to " + item + " / " + body.getProject() + " for user " + actorUserId);
		return ResponseEntity.ok(toDto(saved, body.getRole()));
	}

	@DeleteMapping("/role-menus/{id}")
	public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestParam Integer actorUserId) {
		requirePlatformAdmin(actorUserId);
		dashConstantRepository.findById(id).ifPresent(dc -> {
			auditService.record("role_menu", "deleted", actorUserId,
					"User #" + actorUserId, "menu row " + id + " removed from " + dc.getKeys() + " / " + dc.getProject_name());
			dashConstantRepository.deleteById(id);
		});
		return ResponseEntity.noContent().build();
	}

	private RoleMenuDto toDto(DashConstant dc, String role) {
		RoleMenuDto dto = new RoleMenuDto();
		dto.setId(dc.getId());
		dto.setRole(role);
		dto.setProject(dc.getProject_name());
		ObjectNode node = readValue(dc.getValue());
		dto.setLabel(node.hasNonNull("label") ? node.get("label").asText() : "");
		dto.setIcon(node.hasNonNull("icon") ? node.get("icon").asText() : "");
		dto.setUrl(node.hasNonNull("url") ? node.get("url").asText() : "");
		dto.setHasChildren(node.has("children") && node.get("children").isArray()
				&& ((ArrayNode) node.get("children")).size() > 0);
		return dto;
	}

	private String stripSide(String keys) {
		return keys != null && keys.endsWith(SIDE_SUFFIX)
				? keys.substring(0, keys.length() - SIDE_SUFFIX.length()).trim()
				: keys;
	}

	private ObjectNode readValue(String value) {
		try {
			if (value == null || value.isBlank()) {
				return objectMapper.createObjectNode();
			}
			return (ObjectNode) objectMapper.readTree(value);
		} catch (Exception e) {
			return objectMapper.createObjectNode();
		}
	}

	private String writeValue(ObjectNode node) {
		try {
			return objectMapper.writeValueAsString(node);
		} catch (Exception e) {
			throw new IllegalStateException("Failed to serialize menu item", e);
		}
	}
}
