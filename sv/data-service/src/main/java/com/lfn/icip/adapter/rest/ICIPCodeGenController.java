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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.lfn.icip.adapter.service.impl.ICIPRestAdapterService;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import io.micrometer.core.annotation.Timed;
//import liquibase.pro.license.keymgr.a;

@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/service/codebuddy/v1")
@RefreshScope
public class ICIPCodeGenController {
	
	/** The essedum url. */
	@Value("${ESSEDUM_URL}")
	private String referer;

	/** The plugin service. */
	@Autowired
	private ICIPRestAdapterService iCIPRestAdapterService;
	
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPCodeGenController.class);

	/* Dataset */

	@PostMapping("/clone_detection")
	public ResponseEntity<String> datasetsCreate(@RequestBody String requestbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "aip_project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers)
			throws ClientProtocolException, IOException, URISyntaxException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException

	{
		Map<String, String> params = new HashMap<String, String>();
		if(isInstance!=null && !isInstance.isEmpty()) {
			params.put("isInstance", isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host=referer;
			logger.info("referer generated:{}", host);
		}else {
			logger.info("referer taken from headers:{}", host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance, "clone_detection", project, headers,
				params, requestbody);
		return ResponseEntity.status(200).body(results);
	}

	@GetMapping("/providers")
	public ResponseEntity<String> getDatasetsList(
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "aip_project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers)
			throws ClientProtocolException, IOException, URISyntaxException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException

	{
		Map<String, String> params = new HashMap<String, String>();
		if(isInstance!=null && !isInstance.isEmpty()) {
			params.put("isInstance", isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host=referer;
			logger.info("referer generated:{}", host);
		}else {
			logger.info("referer taken from headers:{}", host);
		}
		String results = iCIPRestAdapterService.callGetMethod(host, adapterInstance, "providers", project,
				headers, params);
		return ResponseEntity.status(200).body(results);
	}


	@PostMapping("/detect_defect")
	public ResponseEntity<String> exportDatasets(@RequestBody String requestbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "aip_project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			 @RequestHeader Map<String, String> headers)
			throws ClientProtocolException, IOException, URISyntaxException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException

	{
		Map<String, String> params = new HashMap<String, String>();
		if(isInstance!=null && !isInstance.isEmpty()) {
			params.put("isInstance", isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host=referer;
			logger.info("referer generated:{}", host);
		}else {
			logger.info("referer taken from headers:{}", host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance, "detect_defect", project,
				headers, params, requestbody);
		return ResponseEntity.status(200).body(results);
	}

	/* Endpoints */

	@PostMapping("/generate")
	public ResponseEntity<String> createEndpoints(@RequestBody String requestbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "aip_project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers)
			throws ClientProtocolException, IOException, URISyntaxException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException {

		Map<String, String> params = new HashMap<String, String>();
		if(isInstance!=null && !isInstance.isEmpty()) {
			params.put("isInstance", isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host=referer;
			logger.info("referer generated:{}", host);
		}else {
			logger.info("referer taken from headers:{}", host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance, "generate", project, headers,
				params, requestbody);
		return ResponseEntity.status(200).body(results);
	}


	@PostMapping("/refine")
	public ResponseEntity<String> endpointsDeployModel(@RequestBody String requestbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "aip_project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers)
			throws ClientProtocolException, IOException, URISyntaxException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if(isInstance!=null && !isInstance.isEmpty()) {
			params.put("isInstance", isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host=referer;
			logger.info("referer generated:{}", host);
		}else {
			logger.info("referer taken from headers:{}", host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance, "refine",
				project, headers, params, requestbody);
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/summarize")
	public ResponseEntity<String> explainEndpoints(@RequestBody String requestbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "aip_project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers)
			throws ClientProtocolException, IOException, URISyntaxException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException {

		Map<String, String> params = new HashMap<String, String>();
		if(isInstance!=null && !isInstance.isEmpty()) {
			params.put("isInstance", isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host=referer;
			logger.info("referer generated:{}", host);
		}else {
			logger.info("referer taken from headers:{}", host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance, "summarize", project,
				headers, params, requestbody);
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/translate")
	public ResponseEntity<String> inferEndpoints(@RequestBody String requestbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "aip_project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers)
			throws ClientProtocolException, IOException, URISyntaxException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if(isInstance!=null && !isInstance.isEmpty()) {
			params.put("isInstance", isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host=referer;
			logger.info("referer generated:{}", host);
		}else {
			logger.info("referer taken from headers:{}", host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance, "translate", project,
				headers, params, requestbody);
		return ResponseEntity.status(200).body(results);
	}

	@PostMapping("/base")
	public ResponseEntity<String> endpointsUndeployModels(@RequestBody String requestbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "aip_project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers)
			throws ClientProtocolException, IOException, URISyntaxException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if(isInstance!=null && !isInstance.isEmpty()) {
			params.put("isInstance", isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host=referer;
			logger.info("referer generated:{}", host);
		}else {
			logger.info("referer taken from headers:{}", host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance, "base",
				project, headers, params, requestbody);

		return ResponseEntity.status(200).body(results);
	}
	
	@PostMapping("/unit-test")
	public ResponseEntity<String> unitTest(@RequestBody String requestbody,
			@RequestParam(name = "adapter_instance", required = true) String adapterInstance,
			@RequestParam(name = "aip_project", required = true) String project,
			@RequestParam(name = "isInstance", required = false) String isInstance,
			@RequestHeader Map<String, String> headers)
			throws ClientProtocolException, IOException, URISyntaxException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		Map<String, String> params = new HashMap<String, String>();
		if(isInstance!=null && !isInstance.isEmpty()) {
			params.put("isInstance", isInstance);
		}
		String host = getHostFromHeader(headers);
		if (host == null || host.isEmpty()) {
			/* Taking LEAP URL Path as host if referer is not present in the headers */
			host=referer;
			logger.info("referer generated:{}", host);
		}else {
			logger.info("referer taken from headers:{}", host);
		}
		String results = iCIPRestAdapterService.callPostMethod(host, adapterInstance, "unit-test",
				project, headers, params, requestbody);

		return ResponseEntity.status(200).body(results);
	}
	
	private String getHostFromHeader(Map<String, String> headers) {
		String hostFromHeader=null;
		hostFromHeader=headers.get(ICIPPluginConstants.REFERER_TITLE_CASE);
		if (hostFromHeader == null || hostFromHeader.isEmpty()) {
			hostFromHeader=headers.get(ICIPPluginConstants.REFERER_LOWER_CASE);
		}
		return hostFromHeader;
	}

}
