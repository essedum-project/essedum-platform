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

package com.infosys.icets.icip.icipwebeditor.rest;

import java.net.URISyntaxException;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.infosys.icets.ai.comm.lib.util.HeaderUtil;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPApps;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedRuntime;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPluginScript;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPAppsRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLFederatedRuntimeRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPStreamingServicesRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPAppService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPluginScriptService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPluginService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.transaction.Transactional;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPluginController.
 *
 * @author icets
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/app")
public class ICIPAppsController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPAppsController.class);

	@Autowired
	ICIPAppsRepository icipApps;

	@Autowired
	private ICIPMLFederatedRuntimeRepository icipMLFedRuntimeRepo;

	@Autowired
	private ICIPStreamingServicesRepository icipStreamingRepo;

	/** The app service. */

	@Autowired
	private IICIPAppService appService;

	@LeapProperty("icip.app.route")
	String appRoute;

	@GetMapping("/{name}/{org}")
	public ResponseEntity<ICIPApps> getApp(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String orgId) {
		logger.info("Getting app by name and organization");
		ICIPApps app = appService.getAppByName(name, orgId);
		return new ResponseEntity<>(app, new HttpHeaders(), HttpStatus.OK);
	}

	@PostMapping("/save")
	@Transactional
	public ResponseEntity<ICIPApps> saveApp(@RequestBody ICIPApps app) throws URISyntaxException {

		ICIPStreamingServices pipelineData = icipStreamingRepo.findByName(app.getJobName());
		if (pipelineData != null) {
			Optional<ICIPMLFederatedRuntime> icipml = icipMLFedRuntimeRepo.findByPipelineid(pipelineData.getCid());
			ICIPMLFederatedRuntime runtimeId = icipml.get();
			if (icipml.isPresent() && app.getTryoutlink() == null) {
				app.setTryoutlink(icipml.get().getConnendpoint());
			}
			icipApps.save(app);

			Optional<ICIPApps> appId = icipApps.findByJobName(app.getJobName());

			runtimeId.setAppid(appId.get().getId());
			icipMLFedRuntimeRepo.save(runtimeId);
		}

		logger.info("Saving app : {}", app.getName());
		return new ResponseEntity<>(appService.save(app), new HttpHeaders(), HttpStatus.OK);
	}

	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteApp(@PathVariable(name = "id") Integer id) throws URISyntaxException {
		logger.info("deleting app with ID : {}", id);
		appService.delete(id);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("App", id.toString())).build();
	}

	@GetMapping("/appRoute/{name}/{org}")
	public ResponseEntity<String> getAppRoute(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String orgId) {
		ICIPApps app = appService.getAppByName(name, orgId);
		if (!(appRoute == null || appRoute.isEmpty())) {
			String url = appRoute + "/" + app.getOrganization() + "/" + app.getName();
			return new ResponseEntity<>(url, new HttpHeaders(), HttpStatus.OK);
		} else {
			return new ResponseEntity<>(app.getTryoutlink(), new HttpHeaders(), HttpStatus.OK);
		}

	}

	@GetMapping("/streamFile/{fileName}/{org}")
	public ResponseEntity<String> getPresignedUrl(@PathVariable("fileName") String fileName,
			@PathVariable("org") String org) {
		try {
			String response = appService.getPresignedUrl(fileName, org);
			return new ResponseEntity<String>(response, new HttpHeaders(), HttpStatus.OK);
		} catch (Exception e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}

	}

	@PostMapping("/uploadToServer")
	public ResponseEntity<String> uploadToStorageServer(
			@RequestParam(name = "objectKey", required = true) String objectKey,
			@RequestParam(name = "uploadFile", required = true) String uploadFile,
			@RequestParam(name = "org", required = true) String org) {
		try {
			String response = appService.uploadToActiveServer(objectKey, uploadFile, org);
			return ResponseEntity.status(200).body(response);
		} catch (Exception e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}

	}

}
