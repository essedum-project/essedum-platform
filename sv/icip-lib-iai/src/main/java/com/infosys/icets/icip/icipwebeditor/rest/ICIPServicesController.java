/* @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.rest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.adapter.service.MlAdaptersService;
import com.infosys.icets.icip.adapter.service.MlInstancesService;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPPartialDatasource;
import com.infosys.icets.icip.dataset.model.MlAdapters;
import com.infosys.icets.icip.dataset.model.MlInstance;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPAppService;

import io.micrometer.core.annotation.Timed;

/**
 * The Class ICIPServicesController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/services")
@RefreshScope
public class ICIPServicesController {

	private static final Logger logger = LoggerFactory.getLogger(ICIPServicesController.class);

	@Autowired
	MlAdaptersService mlAdaptersService;

	@Autowired
	MlInstancesService mlInstancesService;

	/** The i ICIP datasource service. */
	@Autowired
	private IICIPDatasourceService iICIPDatasourceService;
	
	/** The i ICIP dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;
	
	@Autowired
	private IICIPAppService appService;

	public static final String CONNECTION = "connection";

	public static final String FALSE = "false";

	/* Fetches Connection Details by AdapterInstance and Organization */
	@GetMapping("/fetchConnectionDetailsByAdapterInstance")
	public ResponseEntity<Map<String, Object>> getConnectionDetails(
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance) {
		logger.info("Fetching connection details for : {}:{}", adapterInstance, project);
		Map<String, Object> connectionDetails = new HashMap<>();
		ICIPPartialDatasource connection = null;
		if (isInstance == null || isInstance.isEmpty()) {
			connection = iICIPDatasourceService.getPartialDatasource(adapterInstance, project);
		} else if (FALSE.equalsIgnoreCase(isInstance)) {
			MlAdapters mlAdapter = mlAdaptersService.getMlAdapteByNameAndOrganization(adapterInstance, project);
			if (mlAdapter != null)
				connection = iICIPDatasourceService.getPartialDatasource(mlAdapter.getConnectionid(), project);
		} else {
			MlInstance mlInstance = mlInstancesService.getMlInstanceByNameAndOrganization(adapterInstance, project);
			if (mlInstance != null)
				connection = iICIPDatasourceService.getPartialDatasource(mlInstance.getConnectionid(), project);
		}
		connectionDetails.put(CONNECTION, connection);
		return new ResponseEntity<Map<String, Object>>(connectionDetails, new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/appData")
	public ResponseEntity<List<Map<String,Object>>> getAppData() {
		logger.info("Getting app data");
		List<Map<String,Object>> apps = appService.getAllApps();
		//return new ResponseEntity<List<JSONObject>>(apps, new HttpHeaders(), HttpStatus.OK);
		return ResponseEntity.ok().body(apps);
	}
	
	@GetMapping("/fetchDatasetDetails/{nameStr}/{org}")
	public ResponseEntity<ICIPDataset> fetchDatasetDetails(@PathVariable(name = "nameStr") String name,
			@PathVariable(name = "org") String org) {
		logger.info("fetching dataset {}-{}", name, org);
		ICIPDataset iCIPDataset = null;
		try {
			iCIPDataset = datasetService.getDataset(name, org);
		} catch (Exception e) {
			logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(), e.getStackTrace()[0].getClass(),
					e.getStackTrace()[0].getLineNumber());
			if (logger.isDebugEnabled()) {
				logger.error("Error due to:", e);
			}
		}
		return new ResponseEntity<>(iCIPDataset, new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/listOfdatasetBasicDetailsByOrg/{org}")
	public ResponseEntity<List<NameAndAliasDTO>> datasetBasicDetailsByOrg(@PathVariable(name = "org") String org) {
		logger.info("fetching dataset basic details:{}", org);
		List<NameAndAliasDTO> list = new ArrayList<>();
		try {
			list = datasetService.getDatasetBasicDetailsByOrg(org);
		} catch (Exception e) {
			logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(), e.getStackTrace()[0].getClass(),
					e.getStackTrace()[0].getLineNumber());
			if (logger.isDebugEnabled()) {
				logger.error("Error due to:", e);
			}
		}
		return new ResponseEntity<>(list, new HttpHeaders(), HttpStatus.OK);
	}
	
}