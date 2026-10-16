package com.lfn.iamp.usm.menu;

import java.util.List;

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

import io.swagger.v3.oas.annotations.tags.Tag;

import com.lfn.iamp.usm.access.AccessContextService;
import com.lfn.iamp.usm.audit.AuditService;

/** Backs the admin-console "Menu Configuration" screen and the shell's sidebar. */
@RestController
@RequestMapping("/api/usm")
@Tag(name = "Menu", description = "Data-driven navigation (§7)")
public class MenuResource {

	/** Matches rbac_menu_item's seeded threshold for the Menu Configuration screen itself. */
	private static final int PLATFORM_ADMIN = 4;

	private final MenuService menuService;
	private final MenuItemRepository menuItemRepository;
	private final AuditService auditService;
	private final AccessContextService accessContextService;

	public MenuResource(MenuService menuService, MenuItemRepository menuItemRepository, AuditService auditService,
			AccessContextService accessContextService) {
		this.menuService = menuService;
		this.menuItemRepository = menuItemRepository;
		this.auditService = auditService;
		this.accessContextService = accessContextService;
	}

	// Menu Configuration manages the data-driven nav tree platform-wide (not
	// scoped to any project/org), so unlike other screens there's no partial
	// "view your own slice" — it's platform_admin or nothing, for read and write.
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

	@GetMapping("/menu")
	public ResponseEntity<List<MenuItem>> menuFor(@RequestParam Integer userId) {
		return ResponseEntity.ok(menuService.menuFor(userId));
	}

	@GetMapping("/menu-items")
	public ResponseEntity<List<MenuItem>> listAll(@RequestParam Integer actorUserId) {
		requirePlatformAdmin(actorUserId);
		return ResponseEntity.ok(menuItemRepository.findAll());
	}

	@PostMapping("/menu-items")
	public ResponseEntity<MenuItem> create(@RequestParam Integer actorUserId, @RequestBody MenuItem item) {
		requirePlatformAdmin(actorUserId);
		item.setId(null);
		MenuItem saved = menuItemRepository.save(item);
		auditService.record("menu_item", "created", actorUserId, "User #" + actorUserId,
				"menu_item \"" + saved.getLabel() + "\" created");
		return ResponseEntity.ok(saved);
	}

	@PutMapping("/menu-items/{id}")
	public ResponseEntity<MenuItem> update(@PathVariable Integer id, @RequestParam Integer actorUserId,
			@RequestBody MenuItem item) {
		requirePlatformAdmin(actorUserId);
		item.setId(id);
		MenuItem saved = menuItemRepository.save(item);
		auditService.record("menu_item", "updated", actorUserId, "User #" + actorUserId, "menu_item #" + id + " updated");
		return ResponseEntity.ok(saved);
	}

	@DeleteMapping("/menu-items/{id}")
	public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestParam Integer actorUserId) {
		requirePlatformAdmin(actorUserId);
		menuItemRepository.findAll().stream()
				.filter(item -> id.equals(item.getParentId()))
				.forEach(child -> menuItemRepository.deleteById(child.getId()));
		menuItemRepository.deleteById(id);
		auditService.record("menu_item", "deleted", actorUserId, "User #" + actorUserId, "menu_item #" + id + " deleted");
		return ResponseEntity.noContent().build();
	}
}
