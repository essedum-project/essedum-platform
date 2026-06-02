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

package com.lfn.icip.dataset.rest;

import java.io.IOException;
import lombok.extern.log4j.Log4j2;
import java.net.URISyntaxException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.annotation.Resource;
import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import org.apache.commons.codec.DecoderException;
import org.ehcache.Cache;
import org.ehcache.CacheManager;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.lfn.ai.comm.lib.util.exceptions.ApiError;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.lfn.icip.dataset.model.HeaderAttributes;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDataset2;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.ICIPMlIntstance;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository2;
import com.lfn.icip.dataset.service.ICIPMlIntstanceService;
import com.lfn.icip.dataset.service.IICIPDataset2Service;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPDatasetController.
 *
 * @author essedum
 */
@Log4j2
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/service")
@Tag(name = "datasets")
@RefreshScope
public class ICIPProxyController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPProxyController.class);

	/** The plugin service. */
	@Autowired
	private ICIPDatasetPluginsService pluginService;

	/** The i ICIP dataset 2 service. */
	@Autowired
	private IICIPDataset2Service dataset2Service;

	@Autowired
	private ICIPDatasetRepository2 datasetRepository2;

	/** The i ICIP dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;

	/** The i ICIP datasource service. */
	@Autowired
	private IICIPDatasourceService datasourceService;
	
	@Autowired
	private ICIPMlIntstanceService iCIPMlIntstanceService;

	/** The ds util. */
	@Autowired
	IICIPDataSetServiceUtilFactory dsUtil;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/** The encryption key. */
	@EssedumProperty("application.uiconfig.enckeydefault")
	private static String enckeydefault;

	/** The cm. */
	@Resource(name = "cacheManagerBean")
	private CacheManager cm;
	

	/**
	 * Gets the data 1.
	 *
	 * @param name       the name
	 * @param org        the org
	 * @param attributes the attributes
	 * @param limit      the limit
	 * @return the data 1
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws ClassNotFoundException             the class not found exception
	 * @throws SQLException                       the SQL exception
	 * @throws DecoderException                   the decoder exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 * @throws URISyntaxException                 the URI syntax exception
	 */
	@GetMapping(path = "/{dtype}/{dsrcalias}/{dsetalias}/{org}/{removeCache}")
	public ResponseEntity<String> getData(@PathVariable(name = "dsetalias") String dsetalias,
			@PathVariable(name = "dtype") String dtype, @PathVariable(name = "dsrcalias") String dsrcalias,
			@PathVariable(name = "org") String org, @PathVariable(name = "removeCache") Boolean removeCache,
			@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> params)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		String instanceName=params.get(ICIPPluginConstants.INSTANCE);
		ICIPMlIntstance iCIPMlIntstance=null;
		if(instanceName!=null && !instanceName.isEmpty() && ICIPPluginConstants.TRUE.equalsIgnoreCase(instanceName)) {
			iCIPMlIntstance =iCIPMlIntstanceService.getICIPMlIntstancesByAliasAndOrg(dsrcalias, org).get(0);
		}
		ICIPDatasource dsrc=new ICIPDatasource();
		ICIPDataset2 dset=new ICIPDataset2();
		if(iCIPMlIntstance!=null) {
			headers.replace(ICIPPluginConstants.INSTANCE, iCIPMlIntstance.getDatasourcenameforconnection());
			instanceName=iCIPMlIntstance.getDatasourcenameforconnection();
			dsrc = datasourceService.getDatasourceByNameSearch(iCIPMlIntstance.getDatasourcealiasforconnection(), org, dtype, 0, 5).stream()
					.findFirst().get();
			dset= dataset2Service.getPaginatedDatasetsByOrgAndDatasource(org, iCIPMlIntstance.getAdapaternameformethods(), dsetalias, 0, 5)
					.stream().filter(ele -> ele.getAlias().equals(dsetalias)).collect(Collectors.toList()).get(0);
		}else {
			dsrc = datasourceService.getDatasourceByNameSearch(dsrcalias, org, dtype, 0, 5).stream()
					.filter(ele -> ele.getAlias().equals(dsrcalias)).collect(Collectors.toList()).get(0);
			dset= dataset2Service.getPaginatedDatasetsByOrgAndDatasource(org, dsrc.getName(), dsetalias, 0, 5)
					.stream().filter(ele -> ele.getAlias().equals(dsetalias)).collect(Collectors.toList()).get(0);	
		}
		JSONObject attributesFromDataset = new JSONObject(dset.getAttributes());
		JSONArray jSONArrayQueryParamsOfDataset = attributesFromDataset.optJSONArray("QueryParams");
		Map<String,String> queryParamsMapOFDataset=getMapFromJsonArray(jSONArrayQueryParamsOfDataset);
		JSONArray jSONArrayHeadersOfDataset = attributesFromDataset.optJSONArray("Headers");
		Map<String,String> headersMapOFDataset=getMapFromJsonArray(jSONArrayHeadersOfDataset);
		JSONArray parameters = new JSONArray();
		for (Map.Entry<String, String> entry : params.entrySet()) {
			JSONObject paramObj = new JSONObject();
			paramObj.put(ICIPPluginConstants.KEY, entry.getKey());
			paramObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			parameters.put(paramObj);
		}
		/*
		 * Taking QueryParams data available in Dataset and adding if not available in parameters
		 */
		parameters=addParamsOfDataset(parameters,queryParamsMapOFDataset);
		JSONArray headerArray = new JSONArray();
		if(instanceName!=null && !instanceName.isEmpty()) {
			JSONObject headerObj = new JSONObject();
			headerObj.put(ICIPPluginConstants.KEY, ICIPPluginConstants.INSTANCE);
			headerObj.put(ICIPPluginConstants.VALUE, instanceName);
			headerArray.put(headerObj);
		}
		for (Map.Entry<String, String> entry : headers.entrySet()) {
			JSONObject headerObj = new JSONObject();
			headerObj.put(ICIPPluginConstants.KEY, entry.getKey());
			headerObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			JSONArray headersArr = new JSONArray();
			try {
				headersArr = new JSONArray(new JSONObject(dset.getAttributes()).get(ICIPPluginConstants.HEADERS).toString());
			} catch (JSONException jex) {
				logger.error("Cannot parse json");
			}
			for (int i = 0; i < headersArr.length(); ++i) {
				if (headersArr.getJSONObject(i).get(ICIPPluginConstants.KEY).toString().equalsIgnoreCase(entry.getKey())) {
					headerArray.put(headerObj);
					break;
				}

			}

		}
		headerArray = addHeadersFromDatasource(dsrc, headerArray, headers);
		/*
		 * Taking Headers data available in Dataset and adding if not available in headerArray
		 */
		headerArray=addParamsOfDataset(headerArray,headersMapOFDataset);
		JSONObject attributes = new JSONObject(dset.getAttributes()).put("PathVariables", parameters)
				.put(ICIPPluginConstants.HEADERS, headerArray).put("QueryParams", parameters);
//		new JSONObject(attributes).put("Headers", headerArray).toString();
//		new JSONObject(attributes).put("EssedumParams", parameters).toString();
		dset.setAttributes(attributes.toString());
		return getCompleteData(dsrc, dset, org, params.getOrDefault("size", "10"), false, false,
				Integer.parseInt(params.getOrDefault("page", "0")), null, -1, removeCache);
	}

	private JSONArray addParamsOfDataset(JSONArray parameters, Map<String, String> datasetParamsMap) {
		Map<String,String> parametersMap=getMapFromJsonArray(parameters);
		try {
			for (Map.Entry<String, String> entry : datasetParamsMap.entrySet()) {
				if(!parametersMap.containsKey(entry.getKey()) && !parametersMap.containsKey(entry.getKey().toLowerCase())) {
					JSONObject paramObj = new JSONObject();
					paramObj.put(ICIPPluginConstants.KEY, entry.getKey());
					paramObj.put(ICIPPluginConstants.VALUE, entry.getValue());
					parameters.put(paramObj);
				}
			}
			}catch(Exception e) {
				logger.error("Cannot add attributes Of Dataset");
				return parameters;
			}
		return parameters;
	}
	private Map<String,String> getMapFromJsonArray(JSONArray jsonArray){
		Map<String,String> getMapFromJsonArray=new HashMap<>();
		try {
			if(jsonArray!=null)
				for (Object o : jsonArray) {
					JSONObject jsonLineItem = (JSONObject) o;
					String key = jsonLineItem.getString(ICIPPluginConstants.KEY);
					String value = jsonLineItem.getString(ICIPPluginConstants.VALUE);
					getMapFromJsonArray.put(key, value);
				}
			}catch(Exception e) {
				logger.error("Cannot get Map from JsonArray");
				return getMapFromJsonArray;
			}
		return getMapFromJsonArray;	
	}

	private JSONArray addHeadersFromDatasource(ICIPDatasource dsrc, JSONArray headerArray,
			Map<String, String> headers) {
		List<HeaderAttributes> dsrcHeaderAttributes = new ArrayList<>();
		Gson gson = new Gson();
		/*
		 * Taking Headers data available in Datasource and adding if not available in
		 * headers
		 */
		if (dsrc != null && dsrc.getConnectionDetails() != null && !dsrc.getConnectionDetails().isEmpty()) {
			JSONObject dsrcObj = new JSONObject(dsrc.getConnectionDetails());
			if (dsrcObj != null && !dsrcObj.isNull(ICIPPluginConstants.TEST_DATA_SET)) {
				JSONObject testDatasetObj = (JSONObject) dsrcObj.get(ICIPPluginConstants.TEST_DATA_SET);
				if (testDatasetObj != null && !testDatasetObj.isNull(ICIPPluginConstants.ATTRIBUTES)) {
					JSONObject attributesObj = (JSONObject) testDatasetObj.get(ICIPPluginConstants.ATTRIBUTES);
					if (attributesObj != null && !attributesObj.isNull(ICIPPluginConstants.HEADERS)
							&& attributesObj.get(ICIPPluginConstants.HEADERS) instanceof JSONArray) {
						JSONArray headersJSONArray = attributesObj.getJSONArray(ICIPPluginConstants.HEADERS);
						if (headersJSONArray != null && !headersJSONArray.isEmpty()) {
							for (Object obj : headersJSONArray) {
								HeaderAttributes headerAttributes = (HeaderAttributes) gson.fromJson(obj.toString(),
										HeaderAttributes.class);
								dsrcHeaderAttributes.add(headerAttributes);
							}
						}
					}
				}
			}
		}
		if (headerArray == null || headerArray.isEmpty()) {
//			for (Map.Entry<String, String> entry : headers.entrySet()) {
//				JSONObject headerObj = new JSONObject();
//				headerObj.put(ICIPPluginConstants.KEY, entry.getKey());
//				headerObj.put(ICIPPluginConstants.VALUE, entry.getValue());
//				headerArray.put(headerObj);
//			}
			for (HeaderAttributes headerAttributes : dsrcHeaderAttributes) {
				if (!headers.containsKey(headerAttributes.getKey())
						&& !headers.containsKey(headerAttributes.getKey().toLowerCase())) {
					JSONObject headerObj = new JSONObject();
					headerObj.put(ICIPPluginConstants.KEY, headerAttributes.getKey());
					headerObj.put(ICIPPluginConstants.VALUE, headerAttributes.getValue());
					headerArray.put(headerObj);
				}
			}

		} else {
			Map<String, String> existingHeaders = new HashMap<>();
			for (Object obj : headerArray) {
				HeaderAttributes headerAttributes = (HeaderAttributes) gson.fromJson(obj.toString(),
						HeaderAttributes.class);
				existingHeaders.put(headerAttributes.getKey(), headerAttributes.getValue());
			}
			/* Adding heades to headerArray if they are not present */
//			for (Map.Entry<String, String> entry : headers.entrySet()) {
//				if (!existingHeaders.containsKey(entry.getKey())) {
//					JSONObject headerObj = new JSONObject();
//					headerObj.put(ICIPPluginConstants.KEY, entry.getKey());
//					headerObj.put(ICIPPluginConstants.VALUE, entry.getValue());
//					headerArray.put(headerObj);
//				}
//			}
			for (HeaderAttributes headerAttributes : dsrcHeaderAttributes) {
				if (!headers.containsKey(headerAttributes.getKey())
						&& !headers.containsKey(headerAttributes.getKey().toLowerCase())
						&& !existingHeaders.containsKey(headerAttributes.getKey())
						&& !existingHeaders.containsKey(headerAttributes.getKey().toLowerCase())) {
					JSONObject headerObj = new JSONObject();
					headerObj.put(ICIPPluginConstants.KEY, headerAttributes.getKey());
					headerObj.put(ICIPPluginConstants.VALUE, headerAttributes.getValue());
					headerArray.put(headerObj);
				}
			}

		}
		return headerArray;
	}

	@PostMapping(path = "/{dtype}/{dsrcalias}/{dsetalias}/{org}/{removeCache}")
	public ResponseEntity<String> getPostData(@PathVariable(name = "dsetalias") String dsetalias,
			@PathVariable(name = "dtype") String dtype, @PathVariable(name = "dsrcalias") String dsrcalias,
			@PathVariable(name = "org") String org, @PathVariable(name = "removeCache") Boolean removeCache,
			@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> params,
			@RequestBody String body)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		String instanceName=params.get(ICIPPluginConstants.INSTANCE);
		ICIPMlIntstance iCIPMlIntstance=null;
		if(instanceName!=null && !instanceName.isEmpty() && ICIPPluginConstants.TRUE.equalsIgnoreCase(instanceName)) {
			iCIPMlIntstance =iCIPMlIntstanceService.getICIPMlIntstancesByAliasAndOrg(dsrcalias, org).get(0);
		}
		ICIPDatasource dsrc=new ICIPDatasource();
		ICIPDataset2 dset=new ICIPDataset2();
		if(iCIPMlIntstance!=null) {
			headers.replace(ICIPPluginConstants.INSTANCE, iCIPMlIntstance.getDatasourcenameforconnection());
			instanceName=iCIPMlIntstance.getDatasourcenameforconnection();
			dsrc = datasourceService.getDatasourceByNameSearch(iCIPMlIntstance.getDatasourcealiasforconnection(), org, dtype, 0, 5).stream()
					.findFirst().get();
			dset= dataset2Service.getPaginatedDatasetsByOrgAndDatasource(org, iCIPMlIntstance.getAdapaternameformethods(), dsetalias, 0, 5)
					.stream().filter(ele -> ele.getAlias().equals(dsetalias)).collect(Collectors.toList()).get(0);
		}else {
			dsrc = datasourceService.getDatasourceByNameSearch(dsrcalias, org, dtype, 0, 5).stream()
					.filter(ele -> ele.getAlias().equals(dsrcalias)).collect(Collectors.toList()).get(0);
			dset= dataset2Service.getPaginatedDatasetsByOrgAndDatasource(org, dsrc.getName(), dsetalias, 0, 5)
					.stream().filter(ele -> ele.getAlias().equals(dsetalias)).collect(Collectors.toList()).get(0);	
		}
		JSONObject attributesFromDataset = new JSONObject(dset.getAttributes());
		JSONArray jSONArrayQueryParamsOfDataset = attributesFromDataset.optJSONArray("QueryParams");
		Map<String,String> queryParamsMapOFDataset=getMapFromJsonArray(jSONArrayQueryParamsOfDataset);
		JSONArray jSONArrayHeadersOfDataset = attributesFromDataset.optJSONArray("Headers");
		Map<String,String> headersMapOFDataset=getMapFromJsonArray(jSONArrayHeadersOfDataset);
		JSONArray parameters = new JSONArray();
		for (Map.Entry<String, String> entry : params.entrySet()) {
			JSONObject paramObj = new JSONObject();
			paramObj.put(ICIPPluginConstants.KEY, entry.getKey());
			paramObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			parameters.put(paramObj);
		}
		/*
		 * Taking QueryParams data available in Dataset and adding if not available in parameters
		 */
		parameters=addParamsOfDataset(parameters,queryParamsMapOFDataset);
		JSONArray headerArray = new JSONArray();
		if(instanceName!=null && !instanceName.isEmpty()) {
			JSONObject headerObj = new JSONObject();
			headerObj.put(ICIPPluginConstants.KEY, ICIPPluginConstants.INSTANCE);
			headerObj.put(ICIPPluginConstants.VALUE, instanceName);
			headerArray.put(headerObj);
		}
		for (Map.Entry<String, String> entry : headers.entrySet()) {
			JSONObject headerObj = new JSONObject();
			headerObj.put(ICIPPluginConstants.KEY, entry.getKey());
			headerObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			JSONArray headersArr = new JSONArray();
			try {
				headersArr = new JSONArray(new JSONObject(dset.getAttributes()).get(ICIPPluginConstants.HEADERS).toString());
			} catch (JSONException jex) {
				logger.info("No header");		
				}
			for (int i = 0; i < headersArr.length(); ++i) {
				if (headersArr.getJSONObject(i).get(ICIPPluginConstants.KEY).toString().equalsIgnoreCase(entry.getKey())) {
					headerArray.put(headerObj);
					break;
				}

			}
		}
		headerArray = addHeadersFromDatasource(dsrc, headerArray, headers);
		/*
		 * Taking Headers data available in Dataset and adding if not available in headerArray
		 */
		headerArray=addParamsOfDataset(headerArray,headersMapOFDataset);
		JSONObject attributes = new JSONObject(dset.getAttributes()).put("PathVariables", parameters)
				.put(ICIPPluginConstants.HEADERS, headerArray).put("QueryParams", parameters).put("Body", body);
//		attributes = new JSONObject(dset.getAttributes()).put("Headers", headerArray).toString();
//		attributes = new JSONObject(dset.getAttributes()).put("Body", body).toString();
		dset.setAttributes(attributes.toString());
		return getCompleteData(dsrc, dset, org, "10", false, false, 0, null, -1, removeCache);
	}

	@DeleteMapping(path = "/{dtype}/{dsrcalias}/{dsetalias}/{org}/{removeCache}")
	public ResponseEntity<String> deleteData(@PathVariable(name = "dsetalias") String dsetalias,
			@PathVariable(name = "dtype") String dtype, @PathVariable(name = "dsrcalias") String dsrcalias,
			@PathVariable(name = "org") String org, @PathVariable(name = "removeCache") Boolean removeCache,
			@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> params)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		String instanceName=params.get(ICIPPluginConstants.INSTANCE);
		ICIPMlIntstance iCIPMlIntstance=null;
		if(instanceName!=null && !instanceName.isEmpty() && ICIPPluginConstants.TRUE.equalsIgnoreCase(instanceName)) {
			iCIPMlIntstance =iCIPMlIntstanceService.getICIPMlIntstancesByAliasAndOrg(dsrcalias, org).get(0);
		}
		ICIPDatasource dsrc=new ICIPDatasource();
		ICIPDataset2 dset=new ICIPDataset2();
		if(iCIPMlIntstance!=null) {
			headers.replace(ICIPPluginConstants.INSTANCE, iCIPMlIntstance.getDatasourcenameforconnection());
			instanceName=iCIPMlIntstance.getDatasourcenameforconnection();
			dsrc = datasourceService.getDatasourceByNameSearch(iCIPMlIntstance.getDatasourcealiasforconnection(), org, dtype, 0, 5).stream()
					.findFirst().get();
			dset= dataset2Service.getPaginatedDatasetsByOrgAndDatasource(org, iCIPMlIntstance.getAdapaternameformethods(), dsetalias, 0, 5)
					.stream().filter(ele -> ele.getAlias().equals(dsetalias)).collect(Collectors.toList()).get(0);
		}else {
			dsrc = datasourceService.getDatasourceByNameSearch(dsrcalias, org, dtype, 0, 5).stream()
					.filter(ele -> ele.getAlias().equals(dsrcalias)).collect(Collectors.toList()).get(0);
			dset= dataset2Service.getPaginatedDatasetsByOrgAndDatasource(org, dsrc.getName(), dsetalias, 0, 5)
					.stream().filter(ele -> ele.getAlias().equals(dsetalias)).collect(Collectors.toList()).get(0);	
		}
		JSONObject attributesFromDataset = new JSONObject(dset.getAttributes());
		JSONArray jSONArrayQueryParamsOfDataset = attributesFromDataset.optJSONArray("QueryParams");
		Map<String,String> queryParamsMapOFDataset=getMapFromJsonArray(jSONArrayQueryParamsOfDataset);
		JSONArray jSONArrayHeadersOfDataset = attributesFromDataset.optJSONArray("Headers");
		Map<String,String> headersMapOFDataset=getMapFromJsonArray(jSONArrayHeadersOfDataset);
		JSONArray parameters = new JSONArray();
		for (Map.Entry<String, String> entry : params.entrySet()) {
			JSONObject paramObj = new JSONObject();
			paramObj.put(ICIPPluginConstants.KEY, entry.getKey());
			paramObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			parameters.put(paramObj);
		}
		/*
		 * Taking QueryParams data available in Dataset and adding if not available in parameters
		 */
		parameters=addParamsOfDataset(parameters,queryParamsMapOFDataset);
		JSONArray headerArray = new JSONArray();
		if(instanceName!=null && !instanceName.isEmpty()) {
			JSONObject headerObj = new JSONObject();
			headerObj.put(ICIPPluginConstants.KEY, ICIPPluginConstants.INSTANCE);
			headerObj.put(ICIPPluginConstants.VALUE, instanceName);
			headerArray.put(headerObj);
		}
		for (Map.Entry<String, String> entry : headers.entrySet()) {
			JSONObject headerObj = new JSONObject();
			headerObj.put(ICIPPluginConstants.KEY, entry.getKey());
			headerObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			JSONArray headersArr = new JSONArray();
			try {
				headersArr = new JSONArray(new JSONObject(dset.getAttributes()).get(ICIPPluginConstants.HEADERS));
			} catch (JSONException jex) {
				logger.error(jex.getMessage(), jex);
			}
			for (int i = 0; i < headersArr.length(); ++i) {
				if (headersArr.getJSONObject(i).has(entry.getKey())) {
					headerArray.put(headerObj);
					break;
				}

			}

		}
		headerArray = addHeadersFromDatasource(dsrc, headerArray, headers);
		/*
		 * Taking Headers data available in Dataset and adding if not available in headerArray
		 */
		headerArray=addParamsOfDataset(headerArray,headersMapOFDataset);
		JSONObject attributes = new JSONObject(dset.getAttributes()).put("PathVariables", parameters)
				.put(ICIPPluginConstants.HEADERS, headerArray).put("QueryParams", parameters);
		dset.setAttributes(attributes.toString());
		return getCompleteData(dsrc, dset, org, params.getOrDefault("size", "10"), false, false,
				Integer.parseInt(params.getOrDefault("page", "0")), null, -1, removeCache);
	}

	@GetMapping(path = "/dbdata/{dtype}/{dsrcalias}/{dsetalias}/{org}/{removeCache}")
	public ResponseEntity<String> getDbData(@PathVariable(name = "dsetalias") String dsetalias,
			@PathVariable(name = "dtype") String dtype, @PathVariable(name = "dsrcalias") String dsrcalias,
			@PathVariable(name = "org") String org, @PathVariable(name = "removeCache") Boolean removeCache,
			@RequestParam Map<String, String> params)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		// ICIPDatasource dsrc = datasourceService.getDatasourceByNameSearch(dsrcalias, org, dtype, 0, 5).stream()
		// 		.filter(ele -> ele.getAlias().equals(dsrcalias)).collect(Collectors.toList()).get(0);
		// ICIPDataset2 dset = dataset2Service.getPaginatedDatasetsByOrgAndDatasource(org, dsrc.getName(), dsetalias, 0, 5)
		// 		.stream().filter(ele -> ele.getAlias().equals(dsetalias)).collect(Collectors.toList()).get(0);
		ICIPDatasource dsrc = new ICIPDatasource();
		ICIPDataset2 dset = new ICIPDataset2();
		try {
		 dsrc = datasourceService.getDatasourceByNameSearch(dsrcalias, org, dtype, 0, 5).stream()
				.filter(ele -> ele.getAlias().equals(dsrcalias)).collect(Collectors.toList()).get(0);
		 dset = dataset2Service.getPaginatedDatasetsByOrgAndDatasource(org, dsrc.getName(), dsetalias, 0, 5)
				.stream().filter(ele -> ele.getAlias().equals(dsetalias)).collect(Collectors.toList()).get(0);
		}catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			 dsrc = datasourceService.getDatasourceByNameSearch(dsrcalias, org, dtype, 0, 5).stream()
					.filter(ele -> ele.getAlias().equals(dsrcalias)).collect(Collectors.toList()).get(0);
			 dset = datasetRepository2.findDataset(org, dsrc.getName(), dsetalias)
						.stream().filter(ele -> ele.getAlias().equals(dsetalias)).collect(Collectors.toList()).get(0);			
		}
//		String attributes = new JSONObject(dset.getAttributes()).put("params", params).toString();
//		dset.setAttributes(attributes);
		return getCompleteData(dsrc, dset, org, params.getOrDefault("size", "10"), false, false,
				Integer.parseInt(params.getOrDefault("page", "0")), params.getOrDefault("sortEvent", null),
				Integer.parseInt(params.getOrDefault("sortOrder", "-1")), removeCache);
	}

	@DeleteMapping(path = "/dbdata/{dtype}/{dsrcalias}/{dsetalias}/{org}/{removeCache}")
	public ResponseEntity<String> deleteDbData(@PathVariable(name = "dsetalias") String dsetalias,
			@PathVariable(name = "dtype") String dtype, @PathVariable(name = "dsrcalias") String dsrcalias,
			@PathVariable(name = "org") String org, @PathVariable(name = "removeCache") Boolean removeCache,
			@RequestParam Map<String, String> params)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		ICIPDatasource dsrc = datasourceService.getDatasourceByNameSearch(dsrcalias, org, dtype, 0, 5).stream()
				.filter(ele -> ele.getAlias().equals(dsrcalias)).collect(Collectors.toList()).get(0);
		ICIPDataset2 dset = dataset2Service.getPaginatedDatasetsByOrgAndDatasource(org, dsrc.getName(), dsetalias, 0, 5)
				.stream().filter(ele -> ele.getAlias().equals(dsetalias)).collect(Collectors.toList()).get(0);

		String attributes = new JSONObject(dset.getAttributes()).put("params", params.get("param")).toString();
		dset.setAttributes(attributes);
		return getCompleteData(dsrc, dset, org, params.getOrDefault("size", "10"), false, false,
				Integer.parseInt(params.getOrDefault("page", "0")), params.getOrDefault("sortEvent", null),
				Integer.parseInt(params.getOrDefault("sortOrder", "-1")), removeCache);
	}

	/**
	 * Handle all.
	 *
	 * @param ex the ex
	 * @return the response entity
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleAll(Exception ex) {
		logger.error(ex.getMessage(), ex);
		Throwable rootcause = ExceptionUtil.findRootCause(ex);
		ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred");
		return new ResponseEntity<>("There is an application error, please contact the application admin",
				new HttpHeaders(), apiError.getStatus());
	}

	/**
	 * Populate attributes.
	 *
	 * @param actual   the actual
	 * @param incoming the incoming
	 * @return the string
	 */
	public static String populateAttributes(String actual, String incoming) {
		JSONObject newAttrs = new JSONObject(incoming);
		JSONObject actualAttrs = new JSONObject(actual);
		Iterator<String> keysItr = newAttrs.keys();
		while (keysItr.hasNext()) {
			String key = keysItr.next();
			String newValue = newAttrs.get(key).toString();
			actualAttrs.put(key, newValue);
		}
		return actualAttrs.toString();
	}

	/**
	 * Gets the complete data.
	 *
	 * @param name       the name
	 * @param org        the org
	 * @param attributes the attributes
	 * @param limit      the limit
	 * @param justData   the just data
	 * @param asJSON     the as JSON
	 * @param page       the page
	 * @param sortEvent  the sort event
	 * @param sortOrder  the sort order
	 * @return the complete data
	 * @throws InvalidKeyException                the invalid key exception
	 * @throws KeyManagementException             the key management exception
	 * @throws NoSuchAlgorithmException           the no such algorithm exception
	 * @throws NoSuchPaddingException             the no such padding exception
	 * @throws InvalidKeySpecException            the invalid key spec exception
	 * @throws InvalidAlgorithmParameterException the invalid algorithm parameter
	 *                                            exception
	 * @throws IllegalBlockSizeException          the illegal block size exception
	 * @throws BadPaddingException                the bad padding exception
	 * @throws KeyStoreException                  the key store exception
	 * @throws ClassNotFoundException             the class not found exception
	 * @throws SQLException                       the SQL exception
	 * @throws DecoderException                   the decoder exception
	 * @throws IOException                        Signals that an I/O exception has
	 *                                            occurred.
	 * @throws URISyntaxException                 the URI syntax exception
	 */
	ResponseEntity<String> getCompleteData(ICIPDatasource datasource, ICIPDataset2 dataset2, String org, String limit,
			boolean justData, boolean asJSON, int page, String sortEvent, int sortOrder, Boolean removeCache)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		long start = System.currentTimeMillis();
		ICIPDataset dataset = datasetService.getDataset(dataset2.getName(), org);
		dataset.setDatasource(datasource);
		dataset.setAttributes(dataset2.getAttributes());
		String attributes = dataset2.getAttributes();
		Cache cache = cm.getCache("datasetResult", String.class, String.class);
		String id = dataset2.getId().toString();
		if (attributes != null && new JSONObject(attributes).has("Body")
				&& !new JSONObject(attributes).get("Body").toString().isEmpty())
			id = id + new JSONObject(attributes).get("Body").toString();
		else if (attributes != null && new JSONObject(attributes).has("QueryParams"))
			id = id + new JSONObject(attributes).get("QueryParams").toString();
		else if (attributes != null && new JSONObject(attributes).has("params"))
			id = id + ":" + page;
		if (cache != null && cache.containsKey(id)) {
			if (!removeCache) {
				String resultset = cache.get(id).toString();
				if (resultset != null) {
					logger.debug("getDatasetResult ended");
					return ResponseEntity.status(200).body(resultset);
				}
			} else {
				cache.remove(id);
			}
		}
		String results = getResult(page, limit, sortEvent, sortOrder, dataset, justData, asJSON);
		logger.debug("Executed in {} ms", System.currentTimeMillis() - start);
		cache.put(id, results);
		return ResponseEntity.status(200).body(results);
	}

	/**
	 * Gets the result.
	 *
	 * @param page      the page
	 * @param limit     the limit
	 * @param sortEvent the sort event
	 * @param sortOrder the sort order
	 * @param dataset   the dataset
	 * @param justData  the just data
	 * @param asJSON    the as JSON
	 * @return the result
	 * @throws SQLException the SQL exception
	 */
	private String getResult(int page, String limit, String sortEvent, int sortOrder, ICIPDataset dataset,
			boolean justData, boolean asJSON) throws SQLException {
		ICIPDataset2 dataset2 = datasetService.getDataset2(dataset.getName(), dataset.getOrganization());
		String instance=null;
		JSONArray headersArr = new JSONArray();
		try {
			headersArr = new JSONArray(new JSONObject(dataset.getAttributes()).get(ICIPPluginConstants.HEADERS).toString());
			for(Object header:headersArr) {
				JSONObject jSONObject=(JSONObject) header;
				if(ICIPPluginConstants.INSTANCE.equalsIgnoreCase(jSONObject.optString(ICIPPluginConstants.KEY))){
					instance=jSONObject.optString(ICIPPluginConstants.VALUE);
					break;
				}
			}
		} catch (JSONException jex) {
			logger.error("Cannot parse json");
		}
		ICIPDatasource datasource=new ICIPDatasource();
		if(instance!=null){
			datasource = datasourceService.getDatasource(instance,
					dataset2.getOrganization());	
		}else {
			datasource = datasourceService.getDatasource(dataset2.getDatasource(),
					dataset2.getOrganization());
		}

		dataset.setDatasource(datasource);
		if (asJSON) {
			return pluginService.getDataSetService(dataset).getDatasetData(dataset,
					new SQLPagination(page, Integer.parseInt(limit), sortEvent, sortOrder), DATATYPE.JSONHEADER,
					String.class);

		}
		if (justData) {
			return pluginService.getDataSetService(dataset).getDatasetData(dataset,
					new SQLPagination(page, Integer.parseInt(limit), sortEvent, sortOrder), DATATYPE.DATA,
					String.class);
		}
		return pluginService.getDataSetService(dataset).getDatasetData(dataset,
				new SQLPagination(page, Integer.parseInt(limit), sortEvent, sortOrder), DATATYPE.ALL, String.class);
	}

}