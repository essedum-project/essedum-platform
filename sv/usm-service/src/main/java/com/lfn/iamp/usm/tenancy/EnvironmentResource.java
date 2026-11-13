package com.lfn.iamp.usm.tenancy;

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

/** Backs the admin-console Tenancy screen's Environments tab (§3). */
@RestController
@RequestMapping("/api/usm")
@Tag(name = "Tenancy", description = "Project-scoped environments")
public class EnvironmentResource {

	private final EnvironmentRepository environmentRepository;

	public EnvironmentResource(EnvironmentRepository environmentRepository) {
		this.environmentRepository = environmentRepository;
	}

	@GetMapping("/environments")
	public ResponseEntity<List<Environment>> listByProject(@RequestParam Integer projectId) {
		return ResponseEntity.ok(environmentRepository.findByProjectId(projectId));
	}

	@PostMapping("/environments")
	public ResponseEntity<Environment> create(@RequestBody Environment environment) {
		environment.setId(null);
		return ResponseEntity.ok(environmentRepository.save(environment));
	}

	@PutMapping("/environments/{id}")
	public ResponseEntity<Environment> update(@PathVariable Integer id, @RequestBody Environment environment) {
		environment.setId(id);
		return ResponseEntity.ok(environmentRepository.save(environment));
	}

	@DeleteMapping("/environments/{id}")
	public ResponseEntity<Void> delete(@PathVariable Integer id) {
		environmentRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
