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

package com.infosys.icets.icip.adapter.rest;

import java.io.IOException;
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
import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import org.apache.commons.codec.DecoderException;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.adapter.service.MlAdaptersService;
import com.infosys.icets.icip.adapter.service.impl.ICIPRestAdapterService;
import com.infosys.icets.icip.dataset.constants.ICIPPluginConstants;
import com.infosys.icets.icip.dataset.model.HeaderAttributes;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.model.MlAdapters;
import com.infosys.icets.icip.dataset.model.MlInstance;
import com.infosys.icets.icip.dataset.repository.MlInstancesRepository;
import com.infosys.icets.icip.dataset.service.IICIPDataset2Service;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;
import io.micrometer.core.annotation.Timed;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPDatasetController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/adapters")
@RefreshScope
public class ICIPAdaptersController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPAdaptersController.class);

	/** The plugin service. */
	@Autowired
	private ICIPDatasetPluginsService pluginService;

	/** The i ICIP dataset 2 service. */
	@Autowired
	private IICIPDataset2Service dataset2Service;

	/** The i ICIP dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;

	/** The i ICIP datasource service. */
	@Autowired
	private IICIPDatasourceService datasourceService;

	@Autowired
	private MlAdaptersService mlAdaptersService;
	
	@Autowired
	private MlInstancesRepository mlInstancesRepository;
	
	@Autowired
	private ICIPRestAdapterService iCIPRestAdapterService;
	
	/** The leap url. */
	@Value("${LEAP_ULR}")
	private String referer;

	@GetMapping(path = "/{adaptername}/{methodname}/{org}")
	public ResponseEntity<String> getData(@PathVariable(name = "adaptername") String adaptername,
			@PathVariable(name = "methodname") String methodname, @PathVariable(name = "org") String org,
			@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> params)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		ICIPDatasource dsrc = new ICIPDatasource();
		ICIPDataset2 dset = null;
		String instanceName = params.get(ICIPPluginConstants.INSTANCE);
		params.remove(ICIPPluginConstants.INSTANCE);
		MlInstance mlInstance = null;
		if (instanceName != null && !instanceName.isEmpty()
				&& ICIPPluginConstants.TRUE.equalsIgnoreCase(instanceName)) {
			mlInstance = mlInstancesRepository.getMlInstanceByNameAndOrganization(adaptername, org);
		}
		if (mlInstance != null) {
			dsrc = datasourceService.getDatasource(mlInstance.getConnectionid(), org);
			if (ICIPPluginConstants.REST.equalsIgnoreCase(dsrc.getType()))
				dset = dataset2Service.getDatasetsByDatasetAliasAndAdapterNameAndOrganization(methodname,
						mlInstance.getAdaptername(), org).stream().findFirst().get();
		} else if (instanceName != null && !instanceName.isEmpty()
				&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(instanceName)) {
			dsrc = datasourceService.getDatasource(adaptername, org);
		} else {
			MlAdapters mlAdapter = mlAdaptersService.getMlAdapteByNameAndOrganization(adaptername, org);
			dsrc = datasourceService.getDatasource(mlAdapter.getConnectionid(), org);
			if (ICIPPluginConstants.REST.equalsIgnoreCase(dsrc.getType()))
				dset = dataset2Service
						.getDatasetsByDatasetAliasAndAdapterNameAndOrganization(methodname, adaptername, org).stream()
						.findFirst().get();
		}
		if (dset == null) {
			if (instanceName != null && !instanceName.isEmpty()
					&& ICIPPluginConstants.TRUE.equalsIgnoreCase(instanceName))
				params.put(ICIPPluginConstants.INSTANCE, ICIPPluginConstants.TRUE);
			else if (instanceName != null && !instanceName.isEmpty()
					&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(instanceName))
				params.remove(ICIPPluginConstants.INSTANCE);
			else
				params.put(ICIPPluginConstants.INSTANCE, ICIPPluginConstants.FALSE_STRING);
			params.put(ICIPPluginConstants.IS_CACHED, ICIPPluginConstants.FALSE_STRING);
			params.put(ICIPPluginConstants.ADAPTER_INSTANCE, adaptername);
			params.put(ICIPPluginConstants.PROJECT, org);
			ICIPDataset datasetForRemote = new ICIPDataset();
			datasetForRemote.setOrganization(org);
			if (!headers.containsKey(ICIPPluginConstants.REFERER_LOWER_CASE)
					&& !headers.containsKey(ICIPPluginConstants.REFERER_TITLE_CASE))
				headers.put(ICIPPluginConstants.REFERER_LOWER_CASE, referer);
			String headerArray = getJsonArrayFromMap(headers).toString();
			String paramsArray = getJsonArrayFromMap(params).toString();
			JSONObject jSONObjectAttrs = new JSONObject();
			jSONObjectAttrs.put(ICIPPluginConstants.URL, ICIPPluginConstants.MLOPS_APIS.get(methodname));
			jSONObjectAttrs.put(ICIPPluginConstants.REQUEST_METHOD, ICIPPluginConstants.REQUEST_METHOD_GET);
			String ars = jSONObjectAttrs.toString();
			datasetForRemote.setAttributes(ars);
			JSONObject attributes = new JSONObject(datasetForRemote.getAttributes())
					.put(ICIPPluginConstants.PATH_VARIABLES, paramsArray).put(ICIPPluginConstants.HEADERS, headerArray)
					.put(ICIPPluginConstants.QUERY_PARAMS, paramsArray);
			datasetForRemote.setAttributes(attributes.toString());
			dsrc.setType(ICIPPluginConstants.REST);
			datasetForRemote.setDatasource(dsrc);
			datasetForRemote.setType(ICIPPluginConstants.REST);
			String results =""; 
				try {
					results= getResult(
						Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)),
						params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10), null, -1,
						datasetForRemote);
				} catch (Exception e) {
					logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(),
							e.getStackTrace()[0].getClass(), e.getStackTrace()[0].getLineNumber());
					if (logger.isDebugEnabled()) {
						logger.error("Error due to:", e);
					}
					return ResponseEntity.status(422).body(e.getMessage());
				}
			return ResponseEntity.status(200).body(results);
		}
		JSONObject attributesFromDataset = new JSONObject(dset.getAttributes());
		JSONArray jSONArrayQueryParamsOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.QUERY_PARAMS);
		JSONArray jSONArrayPathParamsOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.PATH_VARIABLES);
		Map<String, String> queryParamsMapOFDataset = getMapFromJsonArray(jSONArrayQueryParamsOfDataset);
		Map<String, String> pathParamsMapOFDataset = getMapFromJsonArray(jSONArrayPathParamsOfDataset);
		JSONArray jSONArrayHeadersOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.HEADERS);
		Map<String, String> headersMapOFDataset = getMapFromJsonArray(jSONArrayHeadersOfDataset);
		JSONArray parameters = new JSONArray();
		for (Map.Entry<String, String> entry : params.entrySet()) {
			JSONObject paramObj = new JSONObject();
			paramObj.put(ICIPPluginConstants.KEY, entry.getKey());
			paramObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			parameters.put(paramObj);
		}
		/*
		 * Taking QueryParams data available in Dataset and adding if not available in
		 * parameters
		 */
		parameters = addParamsOfDataset(parameters, queryParamsMapOFDataset);
		parameters = addParamsOfDataset(parameters, pathParamsMapOFDataset);
		JSONArray headerArray = new JSONArray();
		for (Map.Entry<String, String> entry : headers.entrySet()) {
			JSONObject headerObj = new JSONObject();
			headerObj.put(ICIPPluginConstants.KEY, entry.getKey());
			headerObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			JSONArray headersArr = new JSONArray();
			try {
				headersArr = new JSONArray(
						new JSONObject(dset.getAttributes()).get(ICIPPluginConstants.HEADERS).toString());
			} catch (JSONException jex) {
				logger.error("Cannot parse json");
			}
			for (int i = 0; i < headersArr.length(); ++i) {
				if (headersArr.getJSONObject(i).get(ICIPPluginConstants.KEY).toString()
						.equalsIgnoreCase(entry.getKey())) {
					if (!ICIPPluginConstants.AUTHORIZATION.equalsIgnoreCase(entry.getKey()))
						headerArray.put(headerObj);
					break;
				}
			}
		}
		headerArray = addHeadersFromDatasource(dsrc, headerArray, headers);
		/*
		 * Taking Headers data available in Dataset and adding if not available in
		 * headerArray
		 */
		headerArray = addParamsOfDataset(headerArray, headersMapOFDataset);
		JSONObject attributes = new JSONObject(dset.getAttributes()).put(ICIPPluginConstants.PATH_VARIABLES, parameters)
				.put(ICIPPluginConstants.HEADERS, headerArray).put(ICIPPluginConstants.QUERY_PARAMS, parameters);
		dset.setAttributes(attributes.toString());
		return getCompleteData(dsrc, dset, org,
				params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10),
				Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)), null, -1);
	}

	private JSONArray addParamsOfDataset(JSONArray parameters, Map<String, String> datasetParamsMap) {
		Map<String, String> parametersMap = getMapFromJsonArray(parameters);
		try {
			for (Map.Entry<String, String> entry : datasetParamsMap.entrySet()) {
				if (!parametersMap.containsKey(entry.getKey())
						&& !parametersMap.containsKey(entry.getKey().toLowerCase())) {
					JSONObject paramObj = new JSONObject();
					paramObj.put(ICIPPluginConstants.KEY, entry.getKey());
					paramObj.put(ICIPPluginConstants.VALUE, entry.getValue());
					parameters.put(paramObj);
				}
			}
		} catch (Exception e) {
			logger.error("Cannot add attributes Of Dataset");
			return parameters;
		}
		return parameters;
	}

	@PostMapping(path = "/{adaptername}/{methodname}/{org}")
	public ResponseEntity<String> getPostData(@PathVariable(name = "adaptername") String adaptername,
			@PathVariable(name = "methodname") String methodname, @PathVariable(name = "org") String org,
			@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> params,
			@RequestBody String body)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		ICIPDatasource dsrc = new ICIPDatasource();
		ICIPDataset2 dset = null;
		String instanceName = params.get(ICIPPluginConstants.INSTANCE);
		params.remove(ICIPPluginConstants.INSTANCE);
		MlInstance mlInstance = null;
		if (instanceName != null && !instanceName.isEmpty()
				&& ICIPPluginConstants.TRUE.equalsIgnoreCase(instanceName)) {
			mlInstance = mlInstancesRepository.getMlInstanceByNameAndOrganization(adaptername, org);
		}
		if (mlInstance != null) {
			dsrc = datasourceService.getDatasource(mlInstance.getConnectionid(), org);
			if (ICIPPluginConstants.REST.equalsIgnoreCase(dsrc.getType()))
				dset = dataset2Service.getDatasetsByDatasetAliasAndAdapterNameAndOrganization(methodname,
						mlInstance.getAdaptername(), org).stream().findFirst().get();
		} else if (instanceName != null && !instanceName.isEmpty()
				&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(instanceName)) {
			dsrc = datasourceService.getDatasource(adaptername, org);
		} else {
			MlAdapters mlAdapter = mlAdaptersService.getMlAdapteByNameAndOrganization(adaptername, org);
			dsrc = datasourceService.getDatasource(mlAdapter.getConnectionid(), org);
			if (ICIPPluginConstants.REST.equalsIgnoreCase(dsrc.getType()))
				dset = dataset2Service
						.getDatasetsByDatasetAliasAndAdapterNameAndOrganization(methodname, adaptername, org).stream()
						.findFirst().get();
		}
		if (dset == null) {
			if (instanceName != null && !instanceName.isEmpty()
					&& ICIPPluginConstants.TRUE.equalsIgnoreCase(instanceName))
				params.put(ICIPPluginConstants.INSTANCE, ICIPPluginConstants.TRUE);
			else if (instanceName != null && !instanceName.isEmpty()
					&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(instanceName))
				params.remove(ICIPPluginConstants.INSTANCE);
			else
				params.put(ICIPPluginConstants.INSTANCE, ICIPPluginConstants.FALSE_STRING);
			params.put(ICIPPluginConstants.IS_CACHED, ICIPPluginConstants.FALSE_STRING);
			params.put(ICIPPluginConstants.ADAPTER_INSTANCE, adaptername);
			params.put(ICIPPluginConstants.PROJECT, org);
			ICIPDataset datasetForRemote = new ICIPDataset();
			datasetForRemote.setOrganization(org);
			if (!headers.containsKey(ICIPPluginConstants.REFERER_LOWER_CASE)
					&& !headers.containsKey(ICIPPluginConstants.REFERER_TITLE_CASE))
				headers.put(ICIPPluginConstants.REFERER_LOWER_CASE, referer);
			String headerArray = getJsonArrayFromMap(headers).toString();
			String paramsArray = getJsonArrayFromMap(params).toString();
			JSONObject jSONObjectAttrs = new JSONObject();
			jSONObjectAttrs.put(ICIPPluginConstants.URL, ICIPPluginConstants.MLOPS_APIS.get(methodname));
			jSONObjectAttrs.put(ICIPPluginConstants.REQUEST_METHOD, ICIPPluginConstants.REQUEST_METHOD_POST);
			jSONObjectAttrs.put(ICIPPluginConstants.BODY, body);
			jSONObjectAttrs.put(ICIPPluginConstants.BODY_TYPE, ICIPPluginConstants.JSON);
			String ars = jSONObjectAttrs.toString();
			datasetForRemote.setAttributes(ars);
			JSONObject attributes = new JSONObject(datasetForRemote.getAttributes())
					.put(ICIPPluginConstants.PATH_VARIABLES, paramsArray).put(ICIPPluginConstants.HEADERS, headerArray)
					.put(ICIPPluginConstants.QUERY_PARAMS, paramsArray);
			datasetForRemote.setAttributes(attributes.toString());
			dsrc.setType(ICIPPluginConstants.REST);
			datasetForRemote.setDatasource(dsrc);
			datasetForRemote.setType(ICIPPluginConstants.REST);
			String results ="";
			try {
				results = getResult(
						Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)),
						params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10), null, -1,
						datasetForRemote);
			} catch (Exception e) {
				logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(),
						e.getStackTrace()[0].getClass(), e.getStackTrace()[0].getLineNumber());
				if (logger.isDebugEnabled()) {
					logger.error("Error due to:", e);
				}
				return ResponseEntity.status(422).body(e.getMessage());
			}
			return ResponseEntity.status(200).body(results);
		}
		JSONObject attributesFromDataset = new JSONObject(dset.getAttributes());
		JSONArray jSONArrayQueryParamsOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.QUERY_PARAMS);
		JSONArray jSONArrayPathParamsOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.PATH_VARIABLES);
		Map<String, String> queryParamsMapOFDataset = getMapFromJsonArray(jSONArrayQueryParamsOfDataset);
		Map<String, String> pathParamsMapOFDataset = getMapFromJsonArray(jSONArrayPathParamsOfDataset);
		JSONArray jSONArrayHeadersOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.HEADERS);
		Map<String, String> headersMapOFDataset = getMapFromJsonArray(jSONArrayHeadersOfDataset);
		JSONArray parameters = new JSONArray();
		for (Map.Entry<String, String> entry : params.entrySet()) {
			JSONObject paramObj = new JSONObject();
			paramObj.put(ICIPPluginConstants.KEY, entry.getKey());
			paramObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			parameters.put(paramObj);
		}
		/*
		 * Taking QueryParams data available in Dataset and adding if not available in
		 * parameters
		 */
		parameters = addParamsOfDataset(parameters, queryParamsMapOFDataset);
		parameters = addParamsOfDataset(parameters, pathParamsMapOFDataset);
		JSONArray headerArray = new JSONArray();
		for (Map.Entry<String, String> entry : headers.entrySet()) {
			JSONObject headerObj = new JSONObject();
			headerObj.put(ICIPPluginConstants.KEY, entry.getKey());
			headerObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			JSONArray headersArr = new JSONArray();
			try {
				headersArr = new JSONArray(
						new JSONObject(dset.getAttributes()).get(ICIPPluginConstants.HEADERS).toString());
			} catch (JSONException jex) {
				logger.info("No header");
			}
			for (int i = 0; i < headersArr.length(); ++i) {
				if (headersArr.getJSONObject(i).get(ICIPPluginConstants.KEY).toString()
						.equalsIgnoreCase(entry.getKey())) {
					headerArray.put(headerObj);
					break;
				}

			}
		}
		headerArray = addHeadersFromDatasource(dsrc, headerArray, headers);
		/*
		 * Taking Headers data available in Dataset and adding if not available in
		 * headerArray
		 */
		headerArray = addParamsOfDataset(headerArray, headersMapOFDataset);
		JSONObject attributes = new JSONObject(dset.getAttributes()).put(ICIPPluginConstants.PATH_VARIABLES, parameters)
				.put(ICIPPluginConstants.HEADERS, headerArray).put(ICIPPluginConstants.QUERY_PARAMS, parameters)
				.put(ICIPPluginConstants.BODY, body);
		dset.setAttributes(attributes.toString());
		return getCompleteData(dsrc, dset, org, ICIPPluginConstants.SIZE_10, 0, null, -1);
	}

	@DeleteMapping(path = "/{adaptername}/{methodname}/{org}")
	public ResponseEntity<String> deleteData(@PathVariable(name = "adaptername") String adaptername,
			@PathVariable(name = "methodname") String methodname, @PathVariable(name = "org") String org,
			@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> params)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		ICIPDatasource dsrc = new ICIPDatasource();
		ICIPDataset2 dset = null;
		String instanceName = params.get(ICIPPluginConstants.INSTANCE);
		params.remove(ICIPPluginConstants.INSTANCE);
		MlInstance mlInstance = null;
		if (instanceName != null && !instanceName.isEmpty()
				&& ICIPPluginConstants.TRUE.equalsIgnoreCase(instanceName)) {
			mlInstance = mlInstancesRepository.getMlInstanceByNameAndOrganization(adaptername, org);
		}
		if (mlInstance != null) {
			dsrc = datasourceService.getDatasource(mlInstance.getConnectionid(), org);
			if (ICIPPluginConstants.REST.equalsIgnoreCase(dsrc.getType()))
				dset = dataset2Service.getDatasetsByDatasetAliasAndAdapterNameAndOrganization(methodname,
						mlInstance.getAdaptername(), org).stream().findFirst().get();
		} else if (instanceName != null && !instanceName.isEmpty()
				&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(instanceName)) {
			dsrc = datasourceService.getDatasource(adaptername, org);
		} else {
			MlAdapters mlAdapter = mlAdaptersService.getMlAdapteByNameAndOrganization(adaptername, org);
			dsrc = datasourceService.getDatasource(mlAdapter.getConnectionid(), org);
			if (ICIPPluginConstants.REST.equalsIgnoreCase(dsrc.getType()))
				dset = dataset2Service
						.getDatasetsByDatasetAliasAndAdapterNameAndOrganization(methodname, adaptername, org).stream()
						.findFirst().get();
		}
		if (dset == null) {
			if (instanceName != null && !instanceName.isEmpty()
					&& ICIPPluginConstants.TRUE.equalsIgnoreCase(instanceName))
				params.put(ICIPPluginConstants.INSTANCE, ICIPPluginConstants.TRUE);
			else if (instanceName != null && !instanceName.isEmpty()
					&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(instanceName))
				params.remove(ICIPPluginConstants.INSTANCE);
			else
				params.put(ICIPPluginConstants.INSTANCE, ICIPPluginConstants.FALSE_STRING);
			params.put(ICIPPluginConstants.IS_CACHED, ICIPPluginConstants.FALSE_STRING);
			params.put(ICIPPluginConstants.ADAPTER_INSTANCE, adaptername);
			params.put(ICIPPluginConstants.PROJECT, org);
			ICIPDataset datasetForRemote = new ICIPDataset();
			datasetForRemote.setOrganization(org);
			if (!headers.containsKey(ICIPPluginConstants.REFERER_LOWER_CASE)
					&& !headers.containsKey(ICIPPluginConstants.REFERER_TITLE_CASE))
				headers.put(ICIPPluginConstants.REFERER_LOWER_CASE, referer);
			String headerArray = getJsonArrayFromMap(headers).toString();
			String paramsArray = getJsonArrayFromMap(params).toString();
			JSONObject jSONObjectAttrs = new JSONObject();
			jSONObjectAttrs.put(ICIPPluginConstants.URL, ICIPPluginConstants.MLOPS_APIS.get(methodname));
			jSONObjectAttrs.put(ICIPPluginConstants.REQUEST_METHOD, ICIPPluginConstants.REQUEST_METHOD_DELETE);
			String ars = jSONObjectAttrs.toString();
			datasetForRemote.setAttributes(ars);
			JSONObject attributes = new JSONObject(datasetForRemote.getAttributes())
					.put(ICIPPluginConstants.PATH_VARIABLES, paramsArray).put(ICIPPluginConstants.HEADERS, headerArray)
					.put(ICIPPluginConstants.QUERY_PARAMS, paramsArray);
			datasetForRemote.setAttributes(attributes.toString());
			dsrc.setType(ICIPPluginConstants.REST);
			datasetForRemote.setDatasource(dsrc);
			datasetForRemote.setType(ICIPPluginConstants.REST);
			String results;
			try {
				results = getResult(
						Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)),
						params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10), null, -1,
						datasetForRemote);
			} catch (Exception e) {
				logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(),
						e.getStackTrace()[0].getClass(), e.getStackTrace()[0].getLineNumber());
				if (logger.isDebugEnabled()) {
					logger.error("Error due to:", e);
				}
				return ResponseEntity.status(422).body(e.getMessage());
			}
			return ResponseEntity.status(200).body(results);
		}
		JSONObject attributesFromDataset = new JSONObject(dset.getAttributes());
		JSONArray jSONArrayQueryParamsOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.QUERY_PARAMS);
		JSONArray jSONArrayPathParamsOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.PATH_VARIABLES);
		Map<String, String> queryParamsMapOFDataset = getMapFromJsonArray(jSONArrayQueryParamsOfDataset);
		Map<String, String> pathParamsMapOFDataset = getMapFromJsonArray(jSONArrayPathParamsOfDataset);
		JSONArray jSONArrayHeadersOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.HEADERS);
		Map<String, String> headersMapOFDataset = getMapFromJsonArray(jSONArrayHeadersOfDataset);
		JSONArray parameters = new JSONArray();
		for (Map.Entry<String, String> entry : params.entrySet()) {
			JSONObject paramObj = new JSONObject();
			paramObj.put(ICIPPluginConstants.KEY, entry.getKey());
			paramObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			parameters.put(paramObj);
		}
		/*
		 * Taking QueryParams data available in Dataset and adding if not available in
		 * parameters
		 */
		parameters = addParamsOfDataset(parameters, queryParamsMapOFDataset);
		parameters = addParamsOfDataset(parameters, pathParamsMapOFDataset);
		JSONArray headerArray = new JSONArray();
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
		 * Taking Headers data available in Dataset and adding if not available in
		 * headerArray
		 */
		headerArray = addParamsOfDataset(headerArray, headersMapOFDataset);
		JSONObject attributes = new JSONObject(dset.getAttributes()).put(ICIPPluginConstants.PATH_VARIABLES, parameters)
				.put(ICIPPluginConstants.HEADERS, headerArray).put(ICIPPluginConstants.QUERY_PARAMS, parameters);
		dset.setAttributes(attributes.toString());
		return getCompleteData(dsrc, dset, org,
				params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10),
				Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)), null, -1);
	}

	private Map<String, String> getMapFromJsonArray(JSONArray jsonArray) {
		Map<String, String> getMapFromJsonArray = new HashMap<>();
		try {
			if (jsonArray != null)
				for (Object o : jsonArray) {
					JSONObject jsonLineItem = (JSONObject) o;
					String key = jsonLineItem.getString(ICIPPluginConstants.KEY);
					String value = jsonLineItem.getString(ICIPPluginConstants.VALUE);
					getMapFromJsonArray.put(key, value);
				}
		} catch (Exception e) {
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

	ResponseEntity<String> getCompleteData(ICIPDatasource datasource, ICIPDataset2 dataset2, String org, String limit,
			int page, String sortEvent, int sortOrder)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		long start = System.currentTimeMillis();
		ICIPDataset dataset = datasetService.getDataset(dataset2.getName(), org);
		dataset.setDatasource(datasource);
		dataset.setAttributes(dataset2.getAttributes());
		String results = "";
		try {
			results = getResult(page, limit, sortEvent, sortOrder, dataset);
		} catch (Exception e) {
			logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(), e.getStackTrace()[0].getClass(),
					e.getStackTrace()[0].getLineNumber());
			if (logger.isDebugEnabled()) {
				logger.error("Error due to:", e);
			}
			return ResponseEntity.status(422).body(e.getMessage());
		}
		logger.debug("Executed in {} ms", System.currentTimeMillis() - start);
		return ResponseEntity.status(200).body(results);
	}

	private String getResult(int page, String limit, String sortEvent, int sortOrder, ICIPDataset dataset)
			throws SQLException,Exception {
		return pluginService.getDataSetService(dataset).getDatasetData(dataset,
				new SQLPagination(page, Integer.parseInt(limit), sortEvent, sortOrder), DATATYPE.ALL, String.class);
	}

	private JSONArray getJsonArrayFromMap(Map<String, String> mapParams) {
		JSONArray jsonArrayParams = new JSONArray();
		try {
			for (Map.Entry<String, String> param : mapParams.entrySet()) {
				if (!ICIPPluginConstants.CONTENT_LENGTH.equalsIgnoreCase(param.getKey())) {
					JSONObject jSONObject = new JSONObject();
					jSONObject.put(ICIPPluginConstants.KEY, param.getKey());
					jSONObject.put(ICIPPluginConstants.VALUE, param.getValue());
					jsonArrayParams.put(jSONObject);
				}
			}
		} catch (Exception e) {
			logger.error("Cannot get JsonArray from Map");
			return jsonArrayParams;
		}
		return jsonArrayParams;
	}
	
	@PostMapping(path = "/file/{adaptername}/{methodname}/{org}")
	public ResponseEntity<String> getPostDataForFile(@PathVariable(name = "adaptername") String adaptername,
			@PathVariable(name = "methodname") String methodname, @PathVariable(name = "org") String org,
			@RequestHeader Map<String, String> headers, @RequestParam Map<String, String> params,
			@RequestParam("file") MultipartFile file)
			throws InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeySpecException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException,
			KeyStoreException, ClassNotFoundException, SQLException, DecoderException, IOException, URISyntaxException {
		ICIPDatasource dsrc = new ICIPDatasource();
		ICIPDataset2 dset = null;
		String instanceName = params.get(ICIPPluginConstants.INSTANCE);
		params.remove(ICIPPluginConstants.INSTANCE);
		MlInstance mlInstance = null;
		if (instanceName != null && !instanceName.isEmpty()
				&& ICIPPluginConstants.TRUE.equalsIgnoreCase(instanceName)) {
			mlInstance = mlInstancesRepository.getMlInstanceByNameAndOrganization(adaptername, org);
		}
		if (mlInstance != null) {
			dsrc = datasourceService.getDatasource(mlInstance.getConnectionid(), org);
			if (ICIPPluginConstants.REST.equalsIgnoreCase(dsrc.getType()))
				dset = dataset2Service.getDatasetsByDatasetAliasAndAdapterNameAndOrganization(methodname,
						mlInstance.getAdaptername(), org).stream().findFirst().get();
		} else if (instanceName != null && !instanceName.isEmpty()
				&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(instanceName)) {
			dsrc = datasourceService.getDatasource(adaptername, org);
		} else {
			MlAdapters mlAdapter = mlAdaptersService.getMlAdapteByNameAndOrganization(adaptername, org);
			dsrc = datasourceService.getDatasource(mlAdapter.getConnectionid(), org);
			if (ICIPPluginConstants.REST.equalsIgnoreCase(dsrc.getType()))
				dset = dataset2Service
						.getDatasetsByDatasetAliasAndAdapterNameAndOrganization(methodname, adaptername, org).stream()
						.findFirst().get();
		}
		if (dset == null) {
			if (instanceName != null && !instanceName.isEmpty()
					&& ICIPPluginConstants.TRUE.equalsIgnoreCase(instanceName))
				params.put(ICIPPluginConstants.INSTANCE, ICIPPluginConstants.TRUE);
			else if (instanceName != null && !instanceName.isEmpty()
					&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(instanceName))
				params.remove(ICIPPluginConstants.INSTANCE);
			else
				params.put(ICIPPluginConstants.INSTANCE, ICIPPluginConstants.FALSE_STRING);
			params.put(ICIPPluginConstants.IS_CACHED, ICIPPluginConstants.FALSE_STRING);
			params.put(ICIPPluginConstants.ADAPTER_INSTANCE, adaptername);
			params.put(ICIPPluginConstants.PROJECT, org);
			ICIPDataset datasetForRemote = new ICIPDataset();
			datasetForRemote.setOrganization(org);
			if (!headers.containsKey(ICIPPluginConstants.REFERER_LOWER_CASE)
					&& !headers.containsKey(ICIPPluginConstants.REFERER_TITLE_CASE))
				headers.put(ICIPPluginConstants.REFERER_LOWER_CASE, referer);
			String headerArray = getJsonArrayFromMap(headers).toString();
			String paramsArray = getJsonArrayFromMap(params).toString();
			JSONObject jSONObjectAttrs = new JSONObject();
			Map<String, String> fileDetails = iCIPRestAdapterService.uploadTempFileForAdapter(file, org, adaptername,
					methodname);
			jSONObjectAttrs.put(ICIPPluginConstants.URL, ICIPPluginConstants.MLOPS_APIS.get(methodname));
			jSONObjectAttrs.put(ICIPPluginConstants.REQUEST_METHOD, ICIPPluginConstants.REQUEST_METHOD_POST);
			jSONObjectAttrs.put(ICIPPluginConstants.BODY, fileDetails);
			jSONObjectAttrs.put(ICIPPluginConstants.BODY_TYPE, ICIPPluginConstants.FILE);
			String ars = jSONObjectAttrs.toString();
			datasetForRemote.setAttributes(ars);
			JSONObject attributes = new JSONObject(datasetForRemote.getAttributes())
					.put(ICIPPluginConstants.PATH_VARIABLES, paramsArray).put(ICIPPluginConstants.HEADERS, headerArray)
					.put(ICIPPluginConstants.QUERY_PARAMS, paramsArray);
			datasetForRemote.setAttributes(attributes.toString());
			dsrc.setType(ICIPPluginConstants.REST);
			datasetForRemote.setDatasource(dsrc);
			datasetForRemote.setType(ICIPPluginConstants.REST);
			String results="";
			try {
				results = getResult(
						Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)),
						params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10), null, -1,
						datasetForRemote);
			} catch (Exception e) {
				logger.error("Error because of:{} at class:{} and line:{}", e.getMessage(),
						e.getStackTrace()[0].getClass(), e.getStackTrace()[0].getLineNumber());
				if (logger.isDebugEnabled()) {
					logger.error("Error due to:", e);
				}
				return ResponseEntity.status(422).body(e.getMessage());
			}
			return ResponseEntity.status(200).body(results);
		}
		JSONObject attributesFromDataset = new JSONObject(dset.getAttributes());
		JSONArray jSONArrayQueryParamsOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.QUERY_PARAMS);
		JSONArray jSONArrayPathParamsOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.PATH_VARIABLES);
		Map<String, String> queryParamsMapOFDataset = getMapFromJsonArray(jSONArrayQueryParamsOfDataset);
		Map<String, String> pathParamsMapOFDataset = getMapFromJsonArray(jSONArrayPathParamsOfDataset);
		JSONArray jSONArrayHeadersOfDataset = attributesFromDataset.optJSONArray(ICIPPluginConstants.HEADERS);
		Map<String, String> headersMapOFDataset = getMapFromJsonArray(jSONArrayHeadersOfDataset);
		JSONArray parameters = new JSONArray();
		for (Map.Entry<String, String> entry : params.entrySet()) {
			JSONObject paramObj = new JSONObject();
			paramObj.put(ICIPPluginConstants.KEY, entry.getKey());
			paramObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			parameters.put(paramObj);
		}
		/*
		 * Taking QueryParams data available in Dataset and adding if not available in
		 * parameters
		 */
		parameters = addParamsOfDataset(parameters, queryParamsMapOFDataset);
		parameters = addParamsOfDataset(parameters, pathParamsMapOFDataset);
		JSONArray headerArray = new JSONArray();
		for (Map.Entry<String, String> entry : headers.entrySet()) {
			JSONObject headerObj = new JSONObject();
			headerObj.put(ICIPPluginConstants.KEY, entry.getKey());
			headerObj.put(ICIPPluginConstants.VALUE, entry.getValue());
			JSONArray headersArr = new JSONArray();
			try {
				headersArr = new JSONArray(
						new JSONObject(dset.getAttributes()).get(ICIPPluginConstants.HEADERS).toString());
			} catch (JSONException jex) {
				logger.info("No header");
			}
			for (int i = 0; i < headersArr.length(); ++i) {
				if (headersArr.getJSONObject(i).get(ICIPPluginConstants.KEY).toString()
						.equalsIgnoreCase(entry.getKey())) {
					headerArray.put(headerObj);
					break;
				}

			}
		}
		headerArray = addHeadersFromDatasource(dsrc, headerArray, headers);
		/*
		 * Taking Headers data available in Dataset and adding if not available in
		 * headerArray
		 */
		headerArray = addParamsOfDataset(headerArray, headersMapOFDataset);

		Map<String, String> fileDetails = iCIPRestAdapterService.uploadTempFileForAdapter(file, org, adaptername,
				methodname);
		JSONObject attributes = new JSONObject(dset.getAttributes()).put(ICIPPluginConstants.PATH_VARIABLES, parameters)
				.put(ICIPPluginConstants.HEADERS, headerArray).put(ICIPPluginConstants.QUERY_PARAMS, parameters)
				.put(ICIPPluginConstants.BODY, fileDetails);
		dset.setAttributes(attributes.toString());
		return getCompleteData(dsrc, dset, org, ICIPPluginConstants.SIZE_10, 0, null, -1);
	}

	@PostMapping(value = "/uploadTempFileForAdapter/{org}/{adapterName}/{methodName}")
	public ResponseEntity<Map<String, String>> uploadformioTemp(@RequestPart("file") MultipartFile file,
			@PathVariable(name = "org", required = true) String org,
			@PathVariable(name = "adapterName", required = true) String adapterName,
			@PathVariable(name = "methodName", required = true) String methodName) throws Exception {
		Map<String, String> fileDetails = iCIPRestAdapterService.uploadTempFileForAdapter(file, org, adapterName,
				methodName);
		return new ResponseEntity<>(fileDetails, HttpStatus.OK);
	}
}