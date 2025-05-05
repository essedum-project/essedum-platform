/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipmodelserver.rest;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.ssl.TrustStrategy;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.icip.dataset.constants.ICIPPluginConstants;
import com.infosys.icets.icip.dataset.model.ICIPSchemaRegistry;
import com.infosys.icets.icip.dataset.model.dto.ICIPSchemaRegistryDTO;
import com.infosys.icets.icip.icipmodelserver.model.ICIPEndpoints;
import com.infosys.icets.icip.icipmodelserver.model.ICIPModelServers;
import com.infosys.icets.icip.icipmodelserver.model.ICIPPipelineModel;
import com.infosys.icets.icip.icipmodelserver.model.dto.ICIPEndpointsDTO;
import com.infosys.icets.icip.icipmodelserver.model.dto.PipelineModelWithoutBlob;
//import com.infosys.icets.icip.icipmodelserver.repository.ICIPEndpointsRepository;
//import com.infosys.icets.icip.icipmodelserver.service.IICIPEndpointsService;
import com.infosys.icets.icip.icipmodelserver.service.IICIPPipelineModelService;

import io.micrometer.core.annotation.Timed;

//COMMENTED AS PART OF API CLEANUP

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPPipelineModelController.
 *
 * @author icets
 */
//@RestController
//@Timed
//@RequestMapping(path = "/${icip.pathPrefix}/endpoints")
//@RefreshScope
//public class ICIPEndpointController {
//
//	/** The Constant logger. */
//	private static final Logger logger = LoggerFactory.getLogger(ICIPEndpointController.class);
//
//	private static final String ENTITY_NAME = "endpoint";
//
//	/** The claim. */
//	@Value("${security.claim:#{null}}")
//	private String claim;
//	
//	@Autowired
//	private IICIPEndpointsService endpointsService;
//
//	/**
//	 * Gets the model.
//	 *
//	 * @param id the id
//	 * @return the model
//	 */
//	@GetMapping("/{id}")
//	public ResponseEntity<ICIPEndpoints> getEndpoint(@PathVariable(name = "id") int id) {
//		ICIPEndpoints endpoint = endpointsService.findById(id);
//		return new ResponseEntity<>(endpoint, HttpStatus.OK);
//	}
//	
//	@PostMapping("/add")
//	public ResponseEntity<ICIPEndpoints> createICIPEndpoints(@RequestBody ICIPEndpointsDTO endpoint)
//			throws URISyntaxException {
//		logger.info("inside createICIPEndpoints");
//		ModelMapper modelmapper = new ModelMapper();
//		endpoint.setLastmodifiedby(ICIPUtils.getUser(claim));
//		endpoint.setCreatedby(ICIPUtils.getUser(claim));
//		endpoint.setLastmodifieddate(Timestamp.from(Instant.now()));
//
//		ICIPEndpoints endpoint1 = modelmapper.map(endpoint, ICIPEndpoints.class);
//		endpoint1 = endpointsService.save(endpoint1);
//		logger.info("creating endpoint");
//		return ResponseEntity.created(new URI("/api/endpoints/add" + endpoint1.getId()))
//				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, endpoint1.getId().toString())).body(endpoint1);
//		
//	}
//	
//	@PostMapping("/edit")
//	public ResponseEntity<ICIPEndpoints> editICIPEndpoints(@RequestBody ICIPEndpointsDTO endpoint)
//			throws URISyntaxException {
//		logger.info("into edit ep");
//		ICIPEndpoints ep = endpointsService.findById(endpoint.getEndpointid());
//		ep.setEndpointtype(endpoint.getEndpointtype());
//		ep.setDescription(endpoint.getDescription());
//		ep.setConnectiondetails(endpoint.getConnectiondetails());
//		ep.setLastmodifiedby(ICIPUtils.getUser(claim));
//		ep.setLastmodifieddate(Timestamp.from(Instant.now()));
//		ep.setModelname(endpoint.getModelname());
//		ep.setApispec(endpoint.getApispec());
//		ep.setEndpointname(endpoint.getEndpointname());
//		ep.setEndpointtype(endpoint.getEndpointtype());
//		ep.setSample(endpoint.getSample());
//		ep.setTryoutlink(endpoint.getTryoutlink());
//		ep = endpointsService.save(ep);
//		logger.info("updating endpoint");
//		return ResponseEntity.created(new URI("/api/endpoints/edit" + ep.getId()))
//				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, ep.getId().toString())).body(ep);
//	}
//	
//
//	@DeleteMapping("/{id}")
//	public void deleteEndpoint(@PathVariable(name = "id") int id) throws URISyntaxException {
//		try {
//			if (endpointsService.findById(id) != null) {
//				endpointsService.deleteById(id);
//			}
//		} catch (Exception ex) {
//			logger.error("URL incorrect : {}", ex.getMessage());
//		}
//	}
//	@PostMapping("/run")
//	public ResponseEntity<String> executePost(@RequestBody String reqBody)
//			throws URISyntaxException {
//		try {
//		JSONObject req = new JSONObject(reqBody);
//
//		SSLContextBuilder builder = new SSLContextBuilder();
//	    builder.loadTrustMaterial(null, new TrustStrategy() {
//	        @Override
//	        public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {
//	            return true;
//	        }
//	    });
//
//	    SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(
//	            builder.build());
//
//	    CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();
//		if(req.getString("requestType").equals("POST")) {
//			HttpPost httpPost = new HttpPost(req.getString("url"));
//			JSONObject headerJson = req.getJSONObject("headers");
//			JSONObject param = req.getJSONObject("params");
//			if (!headerJson.isEmpty()) {
//				headerJson.keySet().forEach(keyStr ->
//			    {
//			        String keyvalue = headerJson.getString(keyStr);
//			        httpPost.addHeader(keyStr, keyvalue);
//			    });
//			}
//			if (!param.isEmpty()) {
//				List<NameValuePair> nvpList = new ArrayList<>(param.length());
//				param.keySet().forEach(keyStr ->
//			    {
//			        String keyvalue = param.getString(keyStr);
//					nvpList.add(new BasicNameValuePair(keyStr, keyvalue));
//			    });
//				
//				URI paramsUri = new URIBuilder(httpPost.getURI()).addParameters(nvpList).build();
//				httpPost.setURI(paramsUri);
//			}
//
//			StringEntity bodyEntity = new StringEntity(req.getString("body"));
//			httpPost.setEntity(bodyEntity);
//			
//			
//			logger.info("HTTP POST request sent");
//			String response = EntityUtils.toString(httpClient.execute(httpPost).getEntity());
//			return new ResponseEntity<>(response,HttpStatus.OK);
//		}
//		else if(req.getString("requestType").equals("GET")) {
//			HttpGet httpGet = new HttpGet(req.getString("url"));
//			JSONObject headerJson = req.getJSONObject("headers");
//			JSONObject param = req.getJSONObject("params");
//			if (!headerJson.isEmpty()) {
//				headerJson.keySet().forEach(keyStr ->
//			    {
//			        String keyvalue = headerJson.getString(keyStr);
//			        httpGet.addHeader(keyStr, keyvalue);
//			    });
//			}
//			if (!param.isEmpty()) {
//				List<NameValuePair> nvpList = new ArrayList<>(param.length());
//				param.keySet().forEach(keyStr ->
//			    {
//			        String keyvalue = param.getString(keyStr);
//					nvpList.add(new BasicNameValuePair(keyStr, keyvalue));
//			    });
//				URI paramsUri = new URIBuilder(httpGet.getURI()).addParameters(nvpList).build();
//				httpGet.setURI(paramsUri);
//			}
//
//			logger.info("HTTP GET request sent");
//			String response = EntityUtils.toString(httpClient.execute(httpGet).getEntity());
//
//			return new ResponseEntity<>(response,HttpStatus.OK);
//		}else {
//			return new ResponseEntity<>("{\"Request Error\":\"Make a GET or POST request\"}",
//					HttpStatus.BAD_REQUEST);
//		}
//		}catch (Exception e) {
//			logger.error(e.getMessage());
//			return new ResponseEntity<>(
//					"{\"Triggering Error\":\"" + e.getClass().getCanonicalName() + " - " + e.getMessage() + "\"}",
//					HttpStatus.BAD_REQUEST);
//		}
//	}
//	
//}