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

import java.io.IOException;
import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import org.apache.http.client.ClientProtocolException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.icip.adapter.service.impl.ICIPAIOpsAdapterService;
import com.infosys.icets.icip.adapter.service.impl.ICIPRestAdapterService;
import com.infosys.icets.icip.dataset.constants.ICIPAdapterConstants;
import com.infosys.icets.icip.dataset.constants.ICIPPluginConstants;

import io.micrometer.core.annotation.Timed;

@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/service/aiops/v1")
@RefreshScope
public class ICIPAIOpsController {

	/** The leap url. */
	@Value("${LEAP_ULR}")
	private String referer;

	/** The plugin service. */
	@Autowired
	private ICIPRestAdapterService iCIPRestAdapterService;
	
	@Autowired
	private ICIPAIOpsAdapterService iCIPAIOpsAdapterService;

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPAIOpsController.class);

	@PostMapping("/similarTickets")
	public ResponseEntity<String> similarTickets(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.SIMILAR_TICKETS, project, headers, params, requestBody);
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/entities")
	public ResponseEntity<String> entities(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance, ICIPAdapterConstants.ENTITIES,
				project, headers, params, requestBody);		
		String columnName = "entities";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/recommendedResolution")
	public ResponseEntity<String> recommendedResolution(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.RECOMMENDED_RESOLUTION, project, headers, params, requestBody);
		
		String columnName = "recommendedResolution";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);
		
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/recommendedSOP")
	public ResponseEntity<String> recommendedSOP(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.RECOMMENDED_SOP, project, headers, params, requestBody);
		
		String columnName = "recommendedSOP";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);
		
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/recommendedBot")
	public ResponseEntity<String> recommendedBot(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.RECOMMENDED_BOT, project, headers, params, requestBody);
				
		String columnName = "recommendedBot";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/recommendedDescriptionCluster")
	public ResponseEntity<String> recommendedDescriptionCluster(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.RECOMMENDED_DESCRIPTION_CLUSTER, project, headers, params, requestBody);
				
		String columnName = "recommendedDescriptionCluster";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);
		return ResponseEntity.status(200).body(results);
	}
	
	@PostMapping("/resolveTickets")
	public ResponseEntity<String> resolveTickets(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.RESOLVE_TICKETS, project, headers, params, requestBody);
				
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/recommendedResolutionCluster")
	public ResponseEntity<String> recommendedResolutionCluster(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.RECOMMENDED_RESOLUTION_CLUSTER, project, headers, params, requestBody);
				
		String columnName = "recommendedResolutionCluster";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/sentimentAnalysis")
	public ResponseEntity<String> sentimentAnalysis(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.SENTIMENT_ANALYSIS, project, headers, params, requestBody);
		//
				
		String columnName = "ticketSentiment";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);
		//
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/ticketSummarization")
	public ResponseEntity<String> ticketSummarization(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.TICKET_SUMMARIZATION, project, headers, params, requestBody);

		
		String columnName = "ticketSummary";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/priorityPrediction")
	public ResponseEntity<String> priorityPrediction(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.PRIORITY_PREDICTION, project, headers, params, requestBody);

		
		String columnName = "priority";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);

		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/incidentCategorization")
	public ResponseEntity<String> incidentCategorization(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.INCIDENT_CATEGORIZATION, project, headers, params, requestBody);

		
		String columnName = "incidentCategorization";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);

		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/recommendedResponseSLA")
	public ResponseEntity<String> recommendedResponseSLA(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.RECOMMENDED_RESPONSE_SLA, project, headers, params, requestBody);

		
		String columnName = "recommendedResponseSLA";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);

		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/recommendedResolutionSLA")
	public ResponseEntity<String> recommendedResolutionSLA(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.RECOMMENDED_RESOLUTION_SLA, project, headers, params, requestBody);

		
		String columnName = "recommendedResolutionSLA";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);

		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/translation")
	public ResponseEntity<String> translation(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance, ICIPAdapterConstants.TRANSLATION,
				project, headers, params, requestBody);

		
		String columnName = "translation";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);

		return ResponseEntity.status(200).body(results);
	}
	
	@PostMapping("/firstResponse")
	public ResponseEntity<String> firstResponse(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.FIRST_RESPONSE, project, headers, params, requestBody);

		
		String columnName = "firstResponse";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);

		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/automatedFollowUps")
	public ResponseEntity<String> automatedFollowUps(@RequestBody String requestBody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers) throws ClientProtocolException, IOException, URISyntaxException,
			KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if (isInstance != null && !isInstance.isEmpty()) {
			params.put(ICIPPluginConstants.INSTANCE, isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host = referer;
			logger.info(ICIPAdapterConstants.LOG_REFERER_GENERATED, host);
		} else {
			logger.info(ICIPAdapterConstants.LOG_REFERER_TAKEN_FROM_HEADERS, host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance,
				ICIPAdapterConstants.AUTOMATED_FOLLOW_UPS, project, headers, params, requestBody);

		
		String columnName = "automatedFollowUps";
		iCIPAIOpsAdapterService.saveRecommendation(requestBody, results, project, columnName);

		return ResponseEntity.status(200).body(results);
	}

	private String getHostFromHeader(Map<String, String> headers) {
		String hostFromHeader = null;
		hostFromHeader = headers.get(ICIPPluginConstants.REFERER_TITLE_CASE);
		if (hostFromHeader == null || hostFromHeader.isEmpty()) {
			hostFromHeader = headers.get(ICIPPluginConstants.REFERER_LOWER_CASE);
		}
		return hostFromHeader;
	}

}
