package com.lfn.ai.comm.lib.util.rest;

import java.security.KeyException;
import java.util.List;

import javax.management.openmbean.KeyAlreadyExistsException;

import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.lfn.ai.comm.lib.util.dto.ResolvedSecret;
import com.lfn.ai.comm.lib.util.dto.Secret;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.ai.comm.lib.util.service.ApplicationSecretManagerService;
import com.lfn.ai.comm.lib.util.service.SecretsManagerService;


@Controller
@RequestMapping("/api/secrets")
public class SecretManagerController {

	@Autowired
	private ApplicationSecretManagerService asmSevice;

	@Autowired
	private SecretsManagerService smService;

	@GetMapping("/resolve")
	public ResponseEntity<String> resolveSecret(@RequestParam(name = "key", required = true) String key,
			@RequestParam(name = "project", required = true) String project) {

		Secret secret = new Secret();
		secret.setKey(key);
		secret.setOrganization(project);
		try {
			ResolvedSecret resolved = smService.resolveSecret(secret);
			if (Boolean.TRUE.equals(resolved.getIsResolved())) {
				// write ui-sv network layer encryption logic if required
				return ResponseEntity.status(200).body(resolved.getResolvedSecret());
			} else {
				return ResponseEntity.status(500).body(resolved.getErrorMessage());
			}
		} catch (KeyException e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}

	}

	@GetMapping("/list")
	public ResponseEntity<String> listSecret(
			@RequestParam(name = "page", required = false, defaultValue = "0") String page,
			@RequestParam(name = "size", required = false, defaultValue = "10") String size,
			@RequestParam(name = "search", required = false) String search,
			@RequestParam(name = "project", required = true) String project) {

		Secret secret = new Secret();
		//Pageable pageable = Pageable.ofSize(Integer.parseInt(size)).withPage(Integer.parseInt(page));
		Pageable pageable = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
		secret.setOrganization(project);
		secret.setPageable(pageable);
		secret.setSearch(search);

			List<Secret> secretList = asmSevice.listSecret(secret);
			
			return ResponseEntity.status(200).body(new JSONArray(secretList.toArray()).toString() );

	}

	@PutMapping("/add")
	public ResponseEntity<String> addSecret(@RequestParam(name = "key", required = true) String key,
			@RequestParam(name = "value", required = true) String value,
			@RequestParam(name = "project", required = true) String project) {
		Secret secret = new Secret();
		secret.setKey(key);
		secret.setOrganization(project);
		// write ui-sv network layer decryption logic if required
		secret.setValue(value);
		try {
			String response = asmSevice.addSecret(secret);
			return ResponseEntity.status(200).body(response);
		} catch (EssedumException | KeyAlreadyExistsException e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}
	}

	@PutMapping("/update")
	public ResponseEntity<String> updateSecret(@RequestParam(name = "key", required = false) String key,
			@RequestParam(name = "value", required = false) String value,
			@RequestParam(name = "project", required = true) String project) {
		Secret secret = new Secret();
		secret.setKey(key);
		secret.setOrganization(project);
		// write ui-sv network layer decryption logic if required
		secret.setValue(value);
		try {
			String response = asmSevice.updateSecret(secret);
			return ResponseEntity.status(200).body(response);
		} catch (KeyException e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}
	}

	@DeleteMapping("/delete")
	public ResponseEntity<String> deleteSecret(@RequestParam(name = "key", required = false) String key,
			@RequestParam(name = "project", required = true) String project) {
		Secret secret = new Secret();
		secret.setKey(key);
		secret.setOrganization(project);
		try {
			String response = asmSevice.deleteSecret(secret);
			return ResponseEntity.status(200).body(response);
		} catch (KeyException e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}
	}
	@GetMapping("/count")
    public ResponseEntity<Long> getSecretsCount(@RequestParam(name="project",required = true) String project){

		Secret secret = new Secret();
		secret.setOrganization(project);	
		Long response = asmSevice.getSecreteCount(secret);
		return ResponseEntity.status(200).body(response);
    }
	
	@GetMapping("/countBySearch")
    public ResponseEntity<Long> countByProjectIdAndSearch(@RequestParam(name="project",required = true) String project, @RequestParam(name="search", required = false) String search){

		Secret secret = new Secret();
		secret.setOrganization(project);
		secret.setSearch(search); 
		Long response = asmSevice.countByProjectIdAndSearch(secret);
		return ResponseEntity.status(200).body(response);
    }

}