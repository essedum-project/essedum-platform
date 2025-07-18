/* @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.adapter.rest;

import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
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

import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.icip.adapter.service.MlSpecTemplatesService;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.model.MlAdapters;
import com.infosys.icets.icip.dataset.model.MlSpecTemplates;
import com.infosys.icets.icip.dataset.model.MlSpecTemplates2;

import io.micrometer.core.annotation.Timed;

/**
 * The Class MlSpecTemplatesController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/mlspectemplates")
@RefreshScope
public class MlSpecTemplatesController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(MlSpecTemplatesController.class);
    
	@Autowired
	MlSpecTemplatesService mlSpecTemplatesService;
	
	@Value("${security.claim:#{null}}")
	private String claim;

	/* Fetches MlSpecTemplate By Domain Name */
	@GetMapping("/specTemplateByDomainNameAndOrg/{domainName}/{org}")
	public ResponseEntity<MlSpecTemplates> getMlSpecTemplateByDomainNameAndOrg(
			@PathVariable(name = "domainName", required = true) String domainName,
			@PathVariable(name = "org", required = true) String org) {
		return new ResponseEntity<>(mlSpecTemplatesService.getMlSpecTemplateByDomainNameAndOrganization(domainName,org),
				new HttpHeaders(), HttpStatus.OK);
	}
	
	@PostMapping("/add")
	public ResponseEntity<MlSpecTemplates> createSpecTemplate(@RequestBody MlSpecTemplates mlSpecTemplate)
			throws NoSuchAlgorithmException {
		logger.info("creating SpecTemplate:{}", mlSpecTemplate.getDomainname());
		mlSpecTemplate.setCreatedby(ICIPUtils.getUser(claim));
		mlSpecTemplate.setCreatedon(Timestamp.from(Instant.now()));
		mlSpecTemplate.setLastmodifiedon(mlSpecTemplate.getCreatedon());
		return new ResponseEntity<>(mlSpecTemplatesService.save(mlSpecTemplate), new HttpHeaders(),
				HttpStatus.OK);
	}
	@PostMapping("/update")
	public ResponseEntity<MlSpecTemplates> updateMlAdapter(@RequestBody MlSpecTemplates mlSpecTemplate)
			throws NoSuchAlgorithmException {
		logger.info("updating MlSpecTemplate:{}", mlSpecTemplate.getDomainname());
		return new ResponseEntity<>(mlSpecTemplatesService.updateMlSpecTemplate(mlSpecTemplate), new HttpHeaders(), HttpStatus.OK);
	}

	@DeleteMapping("/delete/{domainName}/{org}")
	public ResponseEntity<Map<String, String>> deleteMlSpecTemplate(@PathVariable(name = "domainName") String domainName,
			@PathVariable(name = "org", required = true) String org) {
		logger.info("deleting SpecTemplate:{}", domainName);
		return new ResponseEntity<>(mlSpecTemplatesService.delete(domainName,org), new HttpHeaders(),
				HttpStatus.OK);

	}
	
	@GetMapping("getSpecTemplatesCountByOrg/{org}")
	public ResponseEntity<Long> getMlSpecTemplatesCount(@PathVariable(name = "org", required = true) String org,
			@RequestParam(name = "type", required = false) String filters,
			@RequestParam(name = "query", required = false) String query) {
		try {
			long count = mlSpecTemplatesService.getMlSpecTemplatesCount(org, filters, query);
			return new ResponseEntity<>(count, HttpStatus.OK);
		} catch (Exception e) {
			logger.error("Error in getting template count: {}", e.getMessage());
			return new ResponseEntity<>(0L, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/* Fetches All MlSpecTemplates */
	@GetMapping("/getSpecTemplatesByOrganization/{org}")
	public ResponseEntity<List<MlSpecTemplates2>> getAllMlSpecTemplates(
			@PathVariable(name = "org", required = true) String org,
			@RequestParam(name = "type", required = false) String type,
			@RequestParam(name = "page", required = false, defaultValue = "1") String page,
			@RequestParam(name = "size", required = false) String size,
			@RequestParam(name = "query", required = false) String query) {
		try {
			List<MlSpecTemplates2> specTemplates = mlSpecTemplatesService.getMlSpecTemplatesPageWise(org, type, page,
					size, query);
			return new ResponseEntity<>(specTemplates, HttpStatus.OK);
		} catch (Exception e) {
			logger.error("Error in getting specs: {}", e.getMessage());
			return new ResponseEntity<>(Collections.emptyList(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@GetMapping("/getFiltersByOrganization/{org}")
	public ResponseEntity<Map<String,Object>> getFiltersByOrganization(
			@PathVariable(name = "org", required = true) String org) {
		logger.info("fetching MlAdapters Filters by org:{}", org);
		return new ResponseEntity<Map<String,Object>>(mlSpecTemplatesService.getFiltersByOrganization(org), new HttpHeaders(),
				HttpStatus.OK);
	}
	
	/* Fetches All MlSpecTemplates */
	@GetMapping("/getSpecTemplateNamesByOrganization/{org}")
	public ResponseEntity<List<String>> getSpecTemplatesNamesByOrganization(
			@PathVariable(name = "org", required = true) String org) {
		return new ResponseEntity<>(mlSpecTemplatesService.getSpecTemplatesNamesByOrganization(org), new HttpHeaders(),
				HttpStatus.OK);
	}

}
