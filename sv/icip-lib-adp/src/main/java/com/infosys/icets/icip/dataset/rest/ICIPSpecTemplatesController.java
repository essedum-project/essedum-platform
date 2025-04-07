/* @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.dataset.rest;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.infosys.icets.icip.dataset.model.ICIPSpecTemplate;
import com.infosys.icets.icip.dataset.service.impl.ICIPSpecTemplatesService;
import io.micrometer.core.annotation.Timed;

/**
 * The Class ICIPSpecTemplatesController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/spectemplates")
@RefreshScope
public class ICIPSpecTemplatesController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPSpecTemplatesController.class);

	@Autowired
	ICIPSpecTemplatesService iCIPSpecTemplatesService;

	/* Fetches List of API Spec Template Names */
	@GetMapping("/specTemplateNames/list")
	public ResponseEntity<List<String>> getAllTemplateName() {
		return new ResponseEntity<>(iCIPSpecTemplatesService.getAllTemplateNames(), new HttpHeaders(), HttpStatus.OK);
	}

	/* Fetches ICIPSpecTemplate of API Spec by Template Name */
	@GetMapping("/{templateName}")
	public ResponseEntity<ICIPSpecTemplate> getAllTemplateName(
			@PathVariable(name = "templateName", required = true) String templateName) {
		return new ResponseEntity<>(iCIPSpecTemplatesService.getByTemplateName(templateName), new HttpHeaders(),
				HttpStatus.OK);
	}

	/* Fetches List of API Spec ICIPSpecTemplate */
	@GetMapping("/getAllSpecTemplates")
	public ResponseEntity<List<ICIPSpecTemplate>> getAllSpecTemplates() {
		return new ResponseEntity<>(iCIPSpecTemplatesService.getAllSpecTemplates(), new HttpHeaders(), HttpStatus.OK);
	}

}
