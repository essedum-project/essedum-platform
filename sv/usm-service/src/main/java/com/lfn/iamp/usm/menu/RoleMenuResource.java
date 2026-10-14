package com.lfn.iamp.usm.menu;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
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

	private final DashConstantRepository dashConstantRepository;
	private final AuditService auditService;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public RoleMenuResource(DashConstantRepository dashConstantRepository, AuditService auditService) {
		this.dashConstantRepository = dashConstantRepository;
		this.auditService = auditService;
	}

	/** Distinct role names that have a sidebar menu (e.g. "IT Portfolio Manager"). */
	@GetMapping("/role-menus/roles")
	public ResponseEntity<List<String>> roles() {
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
	public ResponseEntity<List<String>> projects(@RequestParam String role) {
		List<String> projects = dashConstantRepository.findDistinctProjectsForItem(role + SIDE_SUFFIX).stream()
				.filter(p -> p != null && !p.isBlank())
				.distinct()
				.sorted()
				.collect(Collectors.toList());
		return ResponseEntity.ok(projects);
	}

	/** The top-level sidebar items for a role in a project. */
	@GetMapping("/role-menus")
	public ResponseEntity<List<RoleMenuDto>> list(@RequestParam String role, @RequestParam String project) {
		List<RoleMenuDto> rows = new ArrayList<>();
		for (DashConstant dc : dashConstantRepository.findAllDashConstantsbyItemAndProject(role + SIDE_SUFFIX,
				project)) {
			rows.add(toDto(dc, role));
		}
		return ResponseEntity.ok(rows);
	}

	/** Edit a top-level item in place; children in the JSON are preserved. */
	@PutMapping("/role-menus/{id}")
	public ResponseEntity<RoleMenuDto> update(@PathVariable Integer id, @RequestBody RoleMenuDto body) {
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

	/** Add a new top-level item to a role's menu, cloning the project linkage from a sibling. */
	@PostMapping("/role-menus")
	public ResponseEntity<RoleMenuDto> create(@RequestBody RoleMenuDto body) {
		String item = body.getRole() + SIDE_SUFFIX;
		DashConstant dc = new DashConstant();
		dc.setKeys(item);
		dc.setProject_name(body.getProject());
		// Clone project_id / portfolio_id from an existing row of the same role+project.
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
		node.set("children", objectMapper.createArrayNode());
		dc.setValue(writeValue(node));
		DashConstant saved = dashConstantRepository.save(dc);
		auditService.record("role_menu", "created", null, null,
				"menu '" + body.getLabel() + "' added to " + item + " / " + body.getProject());
		return ResponseEntity.ok(toDto(saved, body.getRole()));
	}

	@DeleteMapping("/role-menus/{id}")
	public ResponseEntity<Void> delete(@PathVariable Integer id) {
		dashConstantRepository.findById(id).ifPresent(dc -> auditService.record("role_menu", "deleted", null, null,
				"menu row " + id + " removed from " + dc.getKeys() + " / " + dc.getProject_name()));
		dashConstantRepository.deleteById(id);
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
