package com.lfn.iamp.usm.menu;

import java.util.List;

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

import io.swagger.v3.oas.annotations.tags.Tag;

/** Backs the admin-console "Menu Configuration" screen and the shell's sidebar. */
@RestController
@RequestMapping("/api/usm")
@Tag(name = "Menu", description = "Data-driven navigation (§7)")
public class MenuResource {

	private final MenuService menuService;
	private final MenuItemRepository menuItemRepository;

	public MenuResource(MenuService menuService, MenuItemRepository menuItemRepository) {
		this.menuService = menuService;
		this.menuItemRepository = menuItemRepository;
	}

	@GetMapping("/menu")
	public ResponseEntity<List<MenuItem>> menuFor(@RequestParam Integer userId) {
		return ResponseEntity.ok(menuService.menuFor(userId));
	}

	@GetMapping("/menu-items")
	public ResponseEntity<List<MenuItem>> listAll() {
		return ResponseEntity.ok(menuItemRepository.findAll());
	}

	@PostMapping("/menu-items")
	public ResponseEntity<MenuItem> create(@RequestBody MenuItem item) {
		item.setId(null);
		return ResponseEntity.ok(menuItemRepository.save(item));
	}

	@PutMapping("/menu-items/{id}")
	public ResponseEntity<MenuItem> update(@PathVariable Integer id, @RequestBody MenuItem item) {
		item.setId(id);
		return ResponseEntity.ok(menuItemRepository.save(item));
	}

	@DeleteMapping("/menu-items/{id}")
	public ResponseEntity<Void> delete(@PathVariable Integer id) {
		menuItemRepository.findAll().stream()
				.filter(item -> id.equals(item.getParentId()))
				.forEach(child -> menuItemRepository.deleteById(child.getId()));
		menuItemRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
