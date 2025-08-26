/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.adapter.rest;

import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lfn.icip.adapter.service.MlAdaptersService;
import com.lfn.icip.dataset.model.MlAdapters;

import io.micrometer.core.annotation.Timed;

/**
 * The Class MlAdaptersController.
 *
 * @author essedum
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/mladapters")
@RefreshScope
public class MlAdaptersController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(MlAdaptersController.class);

	@Autowired
	MlAdaptersService mlAdaptersService;

	@PostMapping("/add")
	public ResponseEntity<MlAdapters> createMlAdapter(@RequestBody MlAdapters mlAdapters)
			throws NoSuchAlgorithmException {
		logger.info("creating MlAdapter:{}", mlAdapters.getName());
		return new ResponseEntity<>(mlAdaptersService.save(mlAdapters), new HttpHeaders(), HttpStatus.OK);
	}

	@PostMapping("/update")
	public ResponseEntity<MlAdapters> updateMlAdapter(@RequestBody MlAdapters mlAdapters)
			throws NoSuchAlgorithmException {
		logger.info("updating MlAdapter:{}", mlAdapters.getName());
		return new ResponseEntity<>(mlAdaptersService.updateMlAdapter(mlAdapters), new HttpHeaders(), HttpStatus.OK);
	}

	@PostMapping("/updateAPISpec")
	public ResponseEntity<MlAdapters> updateAPISpec(@RequestBody MlAdapters mlAdapters)
			throws NoSuchAlgorithmException {
		logger.info("updating APISpec for MlAdapter:{}", mlAdapters.getName());
		return new ResponseEntity<>(mlAdaptersService.updateAPISpec(mlAdapters), new HttpHeaders(), HttpStatus.OK);
	}

	/* Fetches MlAdapter By Name and Organization */
	@GetMapping("/getAdapteByNameAndOrganization/{name}/{org}")
	public ResponseEntity<MlAdapters> getMlAdapteByNameAndOrganization(
			@PathVariable(name = "name", required = true) String name,
			@PathVariable(name = "org", required = true) String org) {
		return new ResponseEntity<>(mlAdaptersService.getMlAdapteByNameAndOrganization(name, org), new HttpHeaders(),
				HttpStatus.OK);
	}

	/* Fetches MlAdapter Filters By Organization */
	@GetMapping("/getFiltersByOrganization/{org}")
	public ResponseEntity<Map<String, Object>> getFiltersByOrganization(
			@PathVariable(name = "org", required = true) String org) {
		logger.info("fetching MlAdapters Filters by org:{}", org);
		return new ResponseEntity<Map<String, Object>>(mlAdaptersService.getFiltersByOrganization(org),
				new HttpHeaders(), HttpStatus.OK);
	}

	@DeleteMapping("/delete/{name}/{org}")
	public ResponseEntity<Map<String, String>> deleteMlAdapteByNameAndOrganization(
			@PathVariable(name = "name", required = true) String name,
			@PathVariable(name = "org", required = true) String org) {
		logger.info("deleting MlAdapter:{}", name);
		return new ResponseEntity<Map<String, String>>(mlAdaptersService.deleteMlAdapteByNameAndOrganization(name, org),
				new HttpHeaders(), HttpStatus.OK);
	}

	@GetMapping("/getAdaptersBySpecTemDomNameAndOrg/{spectemplatedomainname}/{org}")
	public ResponseEntity<List<MlAdapters>> getMlAdaptesBySpectemplatedomainname(
			@PathVariable(name = "spectemplatedomainname", required = true) String spectemplatedomainname,
			@PathVariable(name = "org", required = true) String org) {
		logger.info("fetching MlAdapters for spectemplatedomainname:{}", spectemplatedomainname);
		return new ResponseEntity<>(
				mlAdaptersService.getMlAdaptersBySpecTemplateDomainNameAndOrg(spectemplatedomainname, org),
				new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/getAdapterNamesByOrganization/{org}")
	public ResponseEntity<List<String>> getAdapterNamesByOrganization(
			@PathVariable(name = "org", required = true) String org) {
		return new ResponseEntity<>(mlAdaptersService.getAdapterNamesByOrganization(org), new HttpHeaders(),
				HttpStatus.OK);
	}
	
	
	@GetMapping("/getAdaptersCount/count")
	public ResponseEntity<Long> countAdapterImplementations(
			@RequestParam(name = "organization", required = true) String organization,
			@RequestParam(name = "category", required = false) String category,
			@RequestParam(name = "spec", required = false) String spec,
			@RequestParam(name = "connection", required = false) String connection,
			@RequestParam(name = "query", required = false) String query){  
		logger.info("fetching MlAdapters count");
		return new ResponseEntity<>(mlAdaptersService.getAdapterImplementationCount(organization,category,spec,connection,query),
				new HttpHeaders(),HttpStatus.OK);
	}
	
	
	@GetMapping("/getAdaptesByOrganization/{org}")
	public ResponseEntity<List<MlAdapters>> getAdapterImplementations(
			@PathVariable(name = "org", required = true) String org,
			@RequestParam(name = "category", required = false) String category,
			@RequestParam(name = "spec", required = false) String spec,
			@RequestParam(name = "connection", required = false) String connection,
			@RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "page", required = false) Integer page,
            @RequestParam(name = "size",required = false) Integer size){  
		logger.info("fetching MlAdapters List");
        Pageable pageable = (page==null||size==null) ? null : PageRequest.of(Math.max(page - 1, 0), size);
		return new ResponseEntity<>(mlAdaptersService.getAdapterImplementation(org,category,spec,connection,query,pageable).getContent(),
				new HttpHeaders(),HttpStatus.OK);
	}
	
}
