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
package com.lfn.icip.icipmodelserver.v2.service.util;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;
import com.lfn.icip.icipmodelserver.v2.model.dto.ICIPPolyAIRequestWrapper;
import com.lfn.icip.icipmodelserver.v2.model.dto.ICIPPolyAIResponseWrapper;
import com.lfn.icip.icipwebeditor.model.FedEndpointID;
import com.lfn.icip.icipwebeditor.model.FedModelsID;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedEndpointRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;
import com.lfn.icip.icipwebeditor.service.impl.ICIPMLFederatedEndpointService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPMLFederatedModelService;

@Component("azuremodelservice")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPModelServiceAzure implements IICIPModelServiceUtil {
	
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPModelServiceAzure.class);

	@Autowired
	private IICIPDatasourceService dsService;
	
	@Autowired
	private ICIPMLFederatedEndpointRepository fedEndpointRepo;

	/** The plugin service. */
	@Autowired
	private ICIPDatasetPluginsService pluginService;

	/** The essedum url. */
	@Value("${ESSEDUM_URL}")
	private String referer;

	@Override
	public JSONObject getJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "AZURE");
			JSONObject attributes = new JSONObject();
			ds.put("attributes", attributes);
			JSONObject position = new JSONObject();
			ds.put("position", position);
		} catch (JSONException e) {
			logger.error("Exception", e);
		}
		return ds;
	}

	@Override
	public List<ICIPMLFederatedModel> getSyncModelList(ICIPPolyAIRequestWrapper request)
			throws IOException, ParseException {
		JSONObject requestJSON = new JSONObject(request.getRequest());
		String datasource = requestJSON.getString("datasource");
		String org = requestJSON.getString("org");
		String executionEnv = requestJSON.optString("executionEnvironment");

		if (executionEnv != null && !executionEnv.isEmpty()
				&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(executionEnv)) {
			return this.getModelsListFromRemoteVM(datasource, org);
		}
		
		return null;
	}

	
	private List<ICIPMLFederatedModel> getModelsListFromRemoteVM(String datasourceName, String org) {
		ICIPDatasource datasource = dsService.getDatasource(datasourceName, org);
		Map<String, String> headers = new HashMap<>();
		headers.put(ICIPPluginConstants.REFERER_TITLE_CASE, referer);
		Map<String, String> params = new HashMap<>();
		params.put(ICIPPluginConstants.IS_REMOTE_DS, ICIPPluginConstants.TRUE);
		params.put(ICIPPluginConstants.IS_CACHED, ICIPPluginConstants.FALSE_STRING);
		params.put(ICIPPluginConstants.ADAPTER_INSTANCE, datasourceName);
		params.put(ICIPPluginConstants.PROJECT, org);
		ICIPDataset datasetForRemote = new ICIPDataset();
		datasetForRemote.setOrganization(org);
		String headerArray = getJsonArrayFromMap(headers).toString();
		String paramsArray = getJsonArrayFromMap(params).toString();
		JSONObject jSONObjectAttrs = new JSONObject();
		jSONObjectAttrs.put(ICIPPluginConstants.URL, ICIPPluginConstants.MLOPS_APIS.get("projects_models_list"));
		jSONObjectAttrs.put(ICIPPluginConstants.REQUEST_METHOD, ICIPPluginConstants.REQUEST_METHOD_GET);
		String ars = jSONObjectAttrs.toString();
		datasetForRemote.setAttributes(ars);
		JSONObject attributes = new JSONObject(datasetForRemote.getAttributes())
				.put(ICIPPluginConstants.PATH_VARIABLES, paramsArray).put(ICIPPluginConstants.HEADERS, headerArray)
				.put(ICIPPluginConstants.QUERY_PARAMS, paramsArray);
		datasetForRemote.setAttributes(attributes.toString());
		datasource.setType(ICIPPluginConstants.REST);
		datasetForRemote.setDatasource(datasource);
		datasetForRemote.setType(ICIPPluginConstants.REST);
		List<ICIPMLFederatedModel> modelList = new ArrayList<>();
		
		try {
			String results = getResult(Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE,
					ICIPPluginConstants.PAGE_0)),params.getOrDefault(ICIPPluginConstants.SIZE, 
					ICIPPluginConstants.SIZE_10), null, -1,datasetForRemote);
			if (results.startsWith("[")) {
				JSONArray jsonArray = new JSONArray(results);
				for (int i = 0; i < jsonArray.length(); i++) {
					JSONObject jsonObject = jsonArray.getJSONObject(i);
					try {
						ICIPMLFederatedModel dto = parseMLFedModel(jsonObject, datasource, org);
						modelList.add(dto);
					}catch (Exception e) {
						logger.info("error due to:{}", e.getMessage());
					}
				}
			}
		} catch (Exception e) {
			logger.info("error due to:{}", e.getMessage());
			return modelList;
		}
		return modelList;
	}

	
	private ICIPMLFederatedModel parseMLFedModel(JSONObject jsonObject, ICIPDatasource ds, String org) throws ParseException {
		ICIPMLFederatedModel dto = new ICIPMLFederatedModel();
		FedModelsID fedmodid = new FedModelsID();
		fedmodid.setAdapterId(ds.getName());
		String srcId = jsonObject.optString("sourceId");
		if (srcId == null || srcId.isEmpty())
			srcId = jsonObject.optString("sourceId");
		fedmodid.setSourceId(srcId);
		fedmodid.setOrganisation(org);
		jsonObject.optString("description");
//		if (modObj.isPresent()) {
//			dto = modObj.get();
//		} else {
//			dto.setLikes(0);
//			dto.setName(jsonObject.optString("sourceId"));
//			dto.setDescription(description != null ? description.toString() : "");
//		}
		Object value = jsonObject.get("artifacts");
		if (value instanceof String) {
			jsonObject.getString("artifacts");
		} else if (value instanceof JSONObject) {
			jsonObject.getJSONObject("artifacts");
		}
		Object containerValue = jsonObject.get("container");
		if (containerValue instanceof String) {
			jsonObject.getString("container");
		} else if (containerValue instanceof JSONObject) {
			jsonObject.getJSONObject("container");
		}
		dto.setCreatedBy(jsonObject.optString("createdBy"));
		String createdon = jsonObject.optString("createdOn");
		Timestamp ts2 = null;
		try {
			if (createdon != null && !createdon.isEmpty()) {
				DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
				Date date = formatter.parse(createdon);
				ts2 = new Timestamp(date.getTime());
				dto.setCreatedOn(ts2);
			}
		} catch (ParseException e) {
			logger.error("error while parsing createdOn:{}", e);
			try {
				DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
				Date date = formatter.parse(createdon);
				ts2 = new Timestamp(date.getTime());
				dto.setCreatedOn(ts2);
			} catch (Exception ex) {
				logger.error("error while parsing createdOn with Zone:{}", e);
			}
		}
//		dto.setSourceDescription(description != null ? description.toString() : "");
//		dto.setSourceName(jsonObject.optString("sourceId"));
//		dto.setSourceOrg(jsonObject.optString("projectId"));
//		if (dto.getSourceOrg() == null || dto.getSourceOrg().isEmpty())
//			dto.setSourceOrg(jsonObject.optString("sourceOrg"));
		String status = jsonObject.getString("status");
		if (!status.equals("null")) {
//			dto.setSourceStatus(status);
		}
		Date date1 = new Date();
		Timestamp ts1 = new Timestamp(date1.getTime());
//		dto.setSyncDate(ts1);
		if (dto.getCreatedOn() == null)
			dto.setCreatedOn(ts1);
		Integer version = jsonObject.optInt("version");
		if (version != null)
			dto.setVersion(Integer.toString(version));
		else
			dto.setVersion("1");
//		dto.setType("AZURE");
//		dto.setAdapter(ds.getAlias());
//		if (dto.getStatus() != null && dto.getStatus().equalsIgnoreCase("inprogress") && dto.getStatus() != null
//				&& dto.getStatus().equalsIgnoreCase("Registered")) {
//			dto.setStatus("InProgress");
//		} else {
//			dto.setStatus(dto.getStatus());
//		}
//		if (jsonObject.optString("status").equalsIgnoreCase("undeployed")) {
//			dto.setDeployment("");
//		}
//		dto.setRawPayload(jsonObject.toString());
		return dto;
	}
	
	
	/**
	 * @param page
	 * @param limit
	 * @param sortEvent
	 * @param sortOrder
	 * @param dataset
	 * @return
	 * @throws SQLException
	 */
	private String getResult(int page, String limit, String sortEvent, int sortOrder, ICIPDataset dataset)
			throws SQLException {
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

	@Override
	public JSONObject getRegisterModelJson() {

		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "AZURE");
			JSONObject attributes = new JSONObject();
			attributes.put("type", "object");
			JSONObject properties = new JSONObject();
			properties.put("ExperimentName", new JSONObject().put("type", "string"));
			properties.put("RunId", new JSONObject().put("type", "string"));
			properties.put("ModelName", new JSONObject().put("type", "string"));
			attributes.put("properties", properties);
			JSONObject uischema = new JSONObject();
			uischema.put("type", "VerticalLayout");
			JSONArray elements = new JSONArray();
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/ExperimentName"));
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/RunId"));
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/ModelName"));

			uischema.put("elements", elements);
			ds.put("attributes", attributes);
			ds.put("uischema", uischema);

		} catch (Exception e) {
			logger.error("Exception : " + e);
		}
		return ds;
	}

	/*
	 * 
	 * This Method is defined for Register/Create Model
	 */
	@Override
	public ICIPMLFederatedModel registerModel(ICIPPolyAIRequestWrapper request) throws IOException, EssedumException {
		ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
		Boolean isRemoteVMexecutionRequired = false;
		if (!ICIPPluginConstants.REST.equalsIgnoreCase(datasource.getType())) {
			JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
			String executionEnvironment = connectionDetails.optString(ICIPPluginConstants.EXECUTION_ENVIRONMENT);
			if (ICIPPluginConstants.REMOTE.equalsIgnoreCase(executionEnvironment)) {
				isRemoteVMexecutionRequired = true;
				logger.info("Found Remote exec conn: {}", datasource.getAlias());
			}
		}
		if (isRemoteVMexecutionRequired) {
			return this.registerModelFromRemoteVM(datasource, request.getBody());
		}
		ICIPMLFederatedModel saveModel = null;
		try {
			ICIPPolyAIRequestWrapper payload = new ICIPPolyAIRequestWrapper();
			JSONObject content = new JSONObject();
			content.put("datasource", request.getName());
			content.put("org", request.getOrganization());
			payload.setRequest(content.toString());
			JSONObject listJSON = new JSONObject();
			
			saveModel = parseMLFedModel1(listJSON, request.getName(), request.getOrganization());
		
		} catch (JSONException e) {
			logger.error("Exception:" + e.getMessage());
		} catch (ParseException e) {
			logger.error("Exception:" + e.getMessage());
		}
		return saveModel;
	}

	private ICIPMLFederatedModel parseMLFedModel1(JSONObject jsonObj, String dsource, String org)
			throws ParseException {
		ICIPMLFederatedModel dto = new ICIPMLFederatedModel();
//		dto.setSourceName(jsonObj.getString("sourceId"));
//		dto.setName(jsonObj.getString("sourceId"));
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");// 1.688643147483E9
		Date finishedTime = sdf.parse(jsonObj.getString("CreationTime"));
		Timestamp ts2 = new Timestamp(finishedTime.getTime());
		dto.setCreatedOn(ts2);
		dto.setCreatedBy("admin");
		FedModelsID fedmodid = new FedModelsID();
		fedmodid.setAdapterId(dsource);
		fedmodid.setOrganisation(org);
		fedmodid.setSourceId(jsonObj.getString("sourceId"));
//		dto.setSourceModelId(fedmodid);
//		dto.setType("AZURE");
//		dto.setAdapter(dsrcAlias);
//		dto.setRawPayload(jsonObj.toString());
//		dto.setSourceOrg("NULL");
//		dto.setArtifacts(jsonObj.getString("ModelArn"));
//		dto.setContainer(jsonObj.getString("ModelArn"));
//		dto.setSourceStatus("Registered");
//		dto.setStatus("Registered");
		Date date1 = new Date();
		new Timestamp(date1.getTime());
//		dto.setSyncDate(ts1);
		return dto;
	}

	
	private ICIPMLFederatedModel registerModelFromRemoteVM(ICIPDatasource datasource, String reqBody) {
		Map<String, String> headers = new HashMap<>();
		headers.put(ICIPPluginConstants.REFERER_TITLE_CASE, referer);
		headers.put("Content-Type", "application/json");
		Map<String, String> params = new HashMap<>();
		params.put(ICIPPluginConstants.IS_REMOTE_DS, ICIPPluginConstants.TRUE);
		params.put(ICIPPluginConstants.IS_CACHED, ICIPPluginConstants.FALSE_STRING);
		params.put(ICIPPluginConstants.ADAPTER_INSTANCE, datasource.getName());
		params.put(ICIPPluginConstants.PROJECT, datasource.getOrganization());
		ICIPDataset datasetForRemote = new ICIPDataset();
		datasetForRemote.setOrganization(datasource.getOrganization());
		String headerArray = getJsonArrayFromMap(headers).toString();
		String paramsArray = getJsonArrayFromMap(params).toString();
		
		//Get the body for Register Model from getModelBodyForRegister()
		Map<String, Object> bodyMap = getModelBodyForRegister(reqBody);
		String body = JSONObject.valueToString(bodyMap);
		
		JSONObject jSONObjectAttrs = new JSONObject();
		jSONObjectAttrs.put(ICIPPluginConstants.BODY, body);
		jSONObjectAttrs.put(ICIPPluginConstants.URL,
				ICIPPluginConstants.MLOPS_APIS.get("projects_models_register_create"));
		jSONObjectAttrs.put(ICIPPluginConstants.REQUEST_METHOD, ICIPPluginConstants.REQUEST_METHOD_POST);
		String ars = jSONObjectAttrs.toString();
		datasetForRemote.setAttributes(ars);
		JSONObject attributes = new JSONObject(datasetForRemote.getAttributes())
				.put(ICIPPluginConstants.PATH_VARIABLES, paramsArray).put(ICIPPluginConstants.HEADERS, headerArray)
				.put(ICIPPluginConstants.QUERY_PARAMS, paramsArray);
		datasetForRemote.setAttributes(attributes.toString());
		datasource.setType(ICIPPluginConstants.REST);
		datasetForRemote.setDatasource(datasource);
		datasetForRemote.setType(ICIPPluginConstants.REST);
		ICIPMLFederatedModel modelFromVm = new ICIPMLFederatedModel();
		try {
			JSONObject responseJsonObj = null;

			String results = getResult(
					Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)),
					params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10), null, -1,
					datasetForRemote);
			//for results as array --> results.startsWith("[") otherwise results.startsWith("{")
			if (results != null && !results.isEmpty() && results.startsWith("[")) {
				JSONArray respArray = new JSONArray(results);
				if (respArray != null && !respArray.isEmpty()) {
					responseJsonObj = respArray.getJSONObject(0);
				}
			} else {
//				modelFromVm.setStatus(results);
				return modelFromVm;
			}
			modelFromVm = parseMLFedModel(responseJsonObj, datasource, datasource.getOrganization());
			return modelFromVm;
		} catch (Exception e) {
			logger.info("error due to:{}", e.getMessage());
//			modelFromVm.setStatus("Some error occured while trying to register Model");
			return modelFromVm;
		}
	}

	public Map<String, Object> getModelBodyForRegister(String reqBody) {
		JSONObject requestBody = new JSONObject(reqBody);
		Map<String, Object> bodyMap = new HashMap<>();
		bodyMap.put("experiment_name", requestBody.optString("ExperimentName"));
		bodyMap.put("runId", requestBody.optString("RunId"));
		bodyMap.put("model_name", requestBody.optString("ModelName"));
		return bodyMap;
	}


	public JSONObject modelBody(String reqBody) {
		JSONObject requestBody = new JSONObject(reqBody);
		JSONObject body = new JSONObject();
		body.put("experiment_name", requestBody.optString("ExperimentName"));
		body.put("runId", requestBody.optString("RunId"));
		body.put("model_name", requestBody.optString("ModelName"));
		JSONObject requiredBody = new JSONObject(body);
		return requiredBody;

	}

	@Override
	public List<ICIPMLFederatedEndpoint> getSyncEndpointList(ICIPPolyAIRequestWrapper payload)
			throws ParseException, JSONException {
		JSONObject requestJSON = new JSONObject(payload.getRequest());
		String datasource = requestJSON.getString("datasource");
		String org = requestJSON.getString("org");
		String executionEnv = requestJSON.optString("executionEnvironment");
		if (executionEnv != null && !executionEnv.isEmpty()
				&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(executionEnv)) {
			return this.getEndpointsListFromRemoteVM(datasource, org);
		}
		return null;
	}

	private List<ICIPMLFederatedEndpoint> getEndpointsListFromRemoteVM(String datasourceName, String org) {
		ICIPDatasource datasource = dsService.getDatasource(datasourceName, org);
		Map<String, String> headers = new HashMap<>();
		headers.put(ICIPPluginConstants.REFERER_TITLE_CASE, referer);
		Map<String, String> params = new HashMap<>();
		params.put(ICIPPluginConstants.IS_REMOTE_DS, ICIPPluginConstants.TRUE);
		params.put(ICIPPluginConstants.IS_CACHED, ICIPPluginConstants.FALSE_STRING);
		params.put(ICIPPluginConstants.ADAPTER_INSTANCE, datasourceName);
		params.put(ICIPPluginConstants.PROJECT, org);
		ICIPDataset datasetForRemote = new ICIPDataset();
		datasetForRemote.setOrganization(org);
		String headerArray = getJsonArrayFromMap(headers).toString();
		String paramsArray = getJsonArrayFromMap(params).toString();
		JSONObject jSONObjectAttrs = new JSONObject();
		jSONObjectAttrs.put(ICIPPluginConstants.URL,
				ICIPPluginConstants.MLOPS_APIS.get("projects_endpoints_list_list"));
		jSONObjectAttrs.put(ICIPPluginConstants.REQUEST_METHOD, ICIPPluginConstants.REQUEST_METHOD_GET);
		String ars = jSONObjectAttrs.toString();
		datasetForRemote.setAttributes(ars);
		JSONObject attributes = new JSONObject(datasetForRemote.getAttributes())
				.put(ICIPPluginConstants.PATH_VARIABLES, paramsArray).put(ICIPPluginConstants.HEADERS, headerArray)
				.put(ICIPPluginConstants.QUERY_PARAMS, paramsArray);
		datasetForRemote.setAttributes(attributes.toString());
		datasource.setType(ICIPPluginConstants.REST);
		datasetForRemote.setDatasource(datasource);
		datasetForRemote.setType(ICIPPluginConstants.REST);
		List<ICIPMLFederatedEndpoint> endpointList = new ArrayList<>();
		try {
			String results = getResult(
					Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)),
					params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10), null, -1,
					datasetForRemote);
			if (results.startsWith("[")) {
				JSONArray jsonArray = new JSONArray(results);
				for (int i = 0; i < jsonArray.length(); i++) {
					JSONObject jsonObject = jsonArray.getJSONObject(i);
					try {
						ICIPMLFederatedEndpoint dto = parseFedEndpoint(jsonObject, datasource, org);
						endpointList.add(dto);
					} catch (Exception e) {
						logger.info("error due to:{}", e.getMessage());
					}
				}
			}
		} catch (Exception e) {
			logger.info("error due to:{}", e.getMessage());
			return endpointList;
		}
		return endpointList;
	}

	private ICIPMLFederatedEndpoint parseFedEndpoint(JSONObject jsonObject, ICIPDatasource datasource, String org) {
		ICIPMLFederatedEndpoint dto = new ICIPMLFederatedEndpoint();
		dto.setSourceName(jsonObject.optString("sourceName"));
		dto.setName(jsonObject.optString("sourceName"));
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
		try {
			Date finishedTime = sdf.parse(jsonObject.optString("syncDate"));
			Timestamp modTime = new Timestamp(finishedTime.getTime());
			dto.setSourceModifiedDate(modTime);
		} catch (Exception e) {
			logger.info("error due to:{}", e.getMessage());
		}
		dto.setContextUri(jsonObject.optString("artifacts"));
		dto.setStatus(jsonObject.optString("status"));
		dto.setSourcestatus(jsonObject.optString("status"));
		try {
			Date finishedTime2 = sdf.parse(jsonObject.optString("createdOn"));
			Timestamp ts2 = new Timestamp(finishedTime2.getTime());
			dto.setCreatedOn(ts2);
		} catch (Exception e) {
			logger.info("error due to:{}", e.getMessage());
		}
		dto.setAdapter(datasource.getAlias());
		FedEndpointID fedendpointid = new FedEndpointID();
		fedendpointid.setAdapterId(datasource.getName());
		fedendpointid.setOrganisation(org);
		fedendpointid.setSourceId(jsonObject.optString("sourceName"));
		dto.setSourceEndpointId(fedendpointid);
		dto.setIsDeleted(false);
		dto.setSourceOrg(jsonObject.optString("sourceOrg"));
		Date date1 = new Date();
		Timestamp ts1 = new Timestamp(date1.getTime());
		dto.setSyncDate(ts1);
		if (dto.getCreatedOn() == null)
			dto.setCreatedOn(ts1);
		dto.setRawPayload(jsonObject.toString());
		dto.setType("AZURE");
		return dto;
	}

	
	@Override
	public ICIPMLFederatedEndpoint createEndpoint(ICIPPolyAIRequestWrapper request) throws IOException, EssedumException {
		ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
		String reqBody = request.getBody();
		Boolean isRemoteVMexecutionRequired = false;
		if (!ICIPPluginConstants.REST.equalsIgnoreCase(datasource.getType())) {
			JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
			String executionEnvironment = connectionDetails.optString(ICIPPluginConstants.EXECUTION_ENVIRONMENT);
			if (ICIPPluginConstants.REMOTE.equalsIgnoreCase(executionEnvironment)) {
				isRemoteVMexecutionRequired = true;
				logger.info("Found Remote exec conn: {}", datasource.getAlias());
			}
		}
		if (isRemoteVMexecutionRequired) {
			return this.createEndpointFromRemoteVM(datasource, reqBody);
		}
		ICIPMLFederatedEndpoint saveModel = null;
		try {
			ICIPPolyAIRequestWrapper payload = new ICIPPolyAIRequestWrapper();
			JSONObject content = new JSONObject();
			content.put("datasource", request.getName());
			content.put("org", request.getOrganization());
			payload.setRequest(content.toString());
			ICIPPolyAIResponseWrapper response = this.listEndpoints(payload);
			String str = response.getResponse();
			JSONObject resJSON = new JSONObject(str);
			resJSON.getJSONArray("Endpoints");
			JSONObject listJSON = new JSONObject();
			try {
				saveModel = parseFedEndpoint(listJSON, request.getName(), datasource.getAlias(),
						request.getOrganization());
			} catch (ParseException e) {
				logger.error("Exception:" + e.getMessage());
			}
		} catch (IOException e) {
			throw new IOException(e.getMessage());
		}
		return saveModel;
	}



//	public JSONObject endpointConfiguration(String reqBody) {
//		JSONObject requestBody = new JSONObject(reqBody);
//		requestBody.put("name", requestBody.optString("Name"));
//		JSONObject endpointConfig = new JSONObject();
//		endpointConfig.put("identity", requestBody.optString("identity"));
//		JSONObject identityConfig = new JSONObject();
//		identityConfig.put("type", requestBody.optString("Type"));
//		endpointConfig.put("properties", requestBody.optString("properties"));
//		JSONObject propertiesConfig = new JSONObject();
//		propertiesConfig.put("authMode", requestBody.optString("AuthMode"));
//		endpointConfig.put("location", requestBody.optString("Location"));
//		JSONObject epConfigJSON = new JSONObject(endpointConfig);
//		return epConfigJSON;
//	}

	private ICIPMLFederatedEndpoint parseFedEndpoint(JSONObject jsonObj, String dsource, String dsrcAlias, String org)
			throws ParseException {
		ICIPMLFederatedEndpoint dto = new ICIPMLFederatedEndpoint();
		dto.setSourceName(jsonObj.getString("Name"));
		dto.setName(jsonObj.getString("Name"));
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
		Date finishedTime = sdf.parse(jsonObj.getString("LastModifiedTime"));
		Timestamp modTime = new Timestamp(finishedTime.getTime());
		dto.setSourceModifiedDate(modTime);
			dto.setContextUri(jsonObj.getString("EndpointArn"));
		dto.setStatus(jsonObj.getString("Status"));
		dto.setSourcestatus(jsonObj.getString("EndpointStatus"));
		SimpleDateFormat sdf2 = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
		Date finishedTime2 = sdf2.parse(jsonObj.getString("CreationTime"));
		Timestamp ts2 = new Timestamp(finishedTime2.getTime());
		dto.setCreatedOn(ts2);
		dto.setAdapter(dsrcAlias);
		FedEndpointID fedendpointid = new FedEndpointID();
		fedendpointid.setAdapterId(dsource);
		fedendpointid.setOrganisation(org);
		fedendpointid.setSourceId(jsonObj.getString("Name"));
		dto.setSourceEndpointId(fedendpointid);
		if (dto.getIsDeleted() == true) {
			dto.setIsDeleted(true);
		} else {
			dto.setIsDeleted(false);
		}
		dto.setSourceOrg("NULL");
		Date date1 = new Date();
		Timestamp ts1 = new Timestamp(date1.getTime());
		dto.setSyncDate(ts1);
		dto.setRawPayload(jsonObj.toString());
		dto.setType("AZURE");
		return dto;

	}

	private ICIPMLFederatedEndpoint createEndpointFromRemoteVM(ICIPDatasource datasource, String reqBody) {
		Map<String, String> headers = new HashMap<>();
		headers.put(ICIPPluginConstants.REFERER_TITLE_CASE, referer);
		headers.put("Content-Type", "application/json");
		Map<String, String> params = new HashMap<>();
		params.put(ICIPPluginConstants.IS_REMOTE_DS, ICIPPluginConstants.TRUE);
		params.put(ICIPPluginConstants.IS_CACHED, ICIPPluginConstants.FALSE_STRING);
		params.put(ICIPPluginConstants.ADAPTER_INSTANCE, datasource.getName());
		params.put(ICIPPluginConstants.PROJECT, datasource.getOrganization());
		ICIPDataset datasetForRemote = new ICIPDataset();
		datasetForRemote.setOrganization(datasource.getOrganization());
		String headerArray = getJsonArrayFromMap(headers).toString();
		String paramsArray = getJsonArrayFromMap(params).toString();
		Map<String, Object> bodyMap = getBodyObjForEndpointsRegister(reqBody, datasource);
		String body = JSONObject.valueToString(bodyMap);
		JSONObject jSONObjectAttrs = new JSONObject();
		jSONObjectAttrs.put(ICIPPluginConstants.BODY, body);
		jSONObjectAttrs.put(ICIPPluginConstants.URL, ICIPPluginConstants.MLOPS_APIS.get("projects_endpoints_create"));
		jSONObjectAttrs.put(ICIPPluginConstants.REQUEST_METHOD, ICIPPluginConstants.REQUEST_METHOD_POST);
		String ars = jSONObjectAttrs.toString();
		datasetForRemote.setAttributes(ars);
		JSONObject attributes = new JSONObject(datasetForRemote.getAttributes())
				.put(ICIPPluginConstants.PATH_VARIABLES, paramsArray).put(ICIPPluginConstants.HEADERS, headerArray)
				.put(ICIPPluginConstants.QUERY_PARAMS, paramsArray);
		datasetForRemote.setAttributes(attributes.toString());
		datasource.setType(ICIPPluginConstants.REST);
		datasetForRemote.setDatasource(datasource);
		datasetForRemote.setType(ICIPPluginConstants.REST);
		ICIPMLFederatedEndpoint modelFromVm = new ICIPMLFederatedEndpoint();
		try {
			String results = getResult(
					Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)),
					params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10), null, -1,
					datasetForRemote);
			if (results != null && !results.isEmpty() && results.startsWith("{")) {
				JSONObject responseJsonObj = new JSONObject(results);
				modelFromVm.setStatus("Endpoint Registered");
				modelFromVm.setSourceName(responseJsonObj.optString("sourceId"));
				if (modelFromVm.getSourceName() == null || modelFromVm.getSourceName().isEmpty())
					modelFromVm.setSourceName(responseJsonObj.optString("sourceId"));
				modelFromVm.setAdapter(datasource.getName());
				modelFromVm.setType("AZURE");
				return modelFromVm;
			} else {
				modelFromVm.setStatus(results);
				return modelFromVm;
			}
		} catch (Exception e) {
			logger.info("error due to:{}", e.getMessage());
			modelFromVm.setStatus("Some error occured while trying to register Endpoint");
			return modelFromVm;
		}
	}

	public Map<String, Object> getBodyObjForEndpointsRegister(String reqBody, ICIPDatasource datasource) {
		JSONObject reqJsonObj = new JSONObject(reqBody);
		Map<String, Object> bodyMap = new HashMap<>();
//		bodyMap.put("Name", reqJsonObj.optString("Name"));
//		bodyMap.put("Type", reqJsonObj.optString("Type"));
//		bodyMap.put("AuthMode", reqJsonObj.optString("AuthMode"));
//		bodyMap.put("Location", reqJsonObj.optString("Location"));
		
		
		bodyMap.put("name", reqJsonObj.optString("Name"));
		Map<String, Object> identityMap = new HashMap<>();
		identityMap.put("type", reqJsonObj.optString("Type"));
		bodyMap.put("identity", new JSONObject(identityMap));
		Map<String, Object> propertiesMap = new HashMap<>();
		propertiesMap.put("authMode", reqJsonObj.optString("AuthMode"));
		bodyMap.put("properties", new JSONObject(propertiesMap));
		bodyMap.put("location", reqJsonObj.optString("Location"));

		return bodyMap;
	}

	@Override
	public JSONObject getEndpointJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "AZURE");
			JSONObject attributes = new JSONObject();
			attributes.put("Name", "");
			attributes.put("Type", "");
			attributes.put("AuthMode", "");
			attributes.put("Location", "");

			JSONObject uischema = new JSONObject();
			uischema.put("type", "VerticalLayout");
			
			JSONArray elements = new JSONArray();
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Name"));
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Type"));
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/AuthMode"));
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Location"));

			uischema.put("elements", elements);
			ds.put("attributes", attributes);
			ds.put("uischema", uischema);

		} catch (Exception e) {
			logger.error("Exception : " + e);
		}
		return ds;
	}

	@Override
	public ICIPPolyAIResponseWrapper deleteModel(ICIPPolyAIRequestWrapper request)
			throws EssedumException, JSONException, IOException {
		ICIPPolyAIResponseWrapper modelObj = new ICIPPolyAIResponseWrapper();
		JSONObject reqJsonObj = new JSONObject(request.getRequest());
		new ICIPMLFederatedModel();
		FedModelsID fedmodid = new FedModelsID();
		fedmodid.setAdapterId(request.getName());
		fedmodid.setSourceId(reqJsonObj.optString("modelId"));
		fedmodid.setOrganisation(request.getOrganization());
//		Optional<ICIPMLFederatedModel> modObj = fedModelRepo.findById(fedmodid);
//		if (modObj.isPresent()) {
//			dto = modObj.get();
//			Map<String, String> responseFromVM = deleteModelFromRemoteVM(fedmodid.getAdapterId(),
//					fedmodid.getOrganisation(), fedmodid.getSourceId());
//			if (ICIPPluginConstants.MESSAGE_SUCCESS.equalsIgnoreCase(responseFromVM.get(ICIPPluginConstants.MESSAGE))) {
//				fedModelRepo.delete(dto);
//				modelObj.setResponse(responseFromVM.get(ICIPPluginConstants.RESPONSE));
//				modelObj.setType(ICIPPluginConstants.VM_SUCCESS);
//				return modelObj;
//			} else {
//				modelObj.setResponse(responseFromVM.get(ICIPPluginConstants.RESPONSE));
//				modelObj.setType(ICIPPluginConstants.VM_FAILED);
//				return modelObj;
//			}
//		}
		modelObj.setResponse("Failed! Model Not Found in Database");
		modelObj.setType(ICIPPluginConstants.VM_FAILED);
		return modelObj;
	}

	private Map<String, String> deleteModelFromRemoteVM(String datasourceName, String org, String modelId) {
		ICIPDatasource datasource = dsService.getDatasource(datasourceName, org);
		Map<String, String> headers = new HashMap<>();
		headers.put(ICIPPluginConstants.REFERER_TITLE_CASE, referer);
		Map<String, String> params = new HashMap<>();
		params.put(ICIPPluginConstants.IS_REMOTE_DS, ICIPPluginConstants.TRUE);
		params.put(ICIPPluginConstants.IS_CACHED, ICIPPluginConstants.FALSE_STRING);
		params.put(ICIPPluginConstants.ADAPTER_INSTANCE, datasourceName);
		params.put(ICIPPluginConstants.PROJECT, org);
		params.put(ICIPPluginConstants.MODEL_ID, modelId);
		ICIPDataset datasetForRemote = new ICIPDataset();
		datasetForRemote.setOrganization(org);
		String headerArray = getJsonArrayFromMap(headers).toString();
		String paramsArray = getJsonArrayFromMap(params).toString();
		JSONObject jSONObjectAttrs = new JSONObject();
		jSONObjectAttrs.put(ICIPPluginConstants.URL, ICIPPluginConstants.MLOPS_APIS.get("projects_models_delete"));
		jSONObjectAttrs.put(ICIPPluginConstants.REQUEST_METHOD, ICIPPluginConstants.REQUEST_METHOD_DELETE);
		String ars = jSONObjectAttrs.toString();
		datasetForRemote.setAttributes(ars);
		JSONObject attributes = new JSONObject(datasetForRemote.getAttributes())
				.put(ICIPPluginConstants.PATH_VARIABLES, paramsArray).put(ICIPPluginConstants.HEADERS, headerArray)
				.put(ICIPPluginConstants.QUERY_PARAMS, paramsArray);
		datasetForRemote.setAttributes(attributes.toString());
		datasource.setType(ICIPPluginConstants.REST);
		datasetForRemote.setDatasource(datasource);
		datasetForRemote.setType(ICIPPluginConstants.REST);
		Map<String, String> res = new HashMap<>();
		try {
			String results = getResult(
					Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)),
					params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10), null, -1,
					datasetForRemote);
			logger.info("results:{}", results);
			if (results.startsWith("{")) {
				res.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_SUCCESS);
				res.put(ICIPPluginConstants.RESPONSE, ICIPPluginConstants.MESSAGE_SUCCESS);
				return res;
			} else {
				res.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_FAILED);
				return res;
			}
		} catch (Exception e) {
			logger.info("error due to:{}", e.getMessage());
			res.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_FAILED);
			return res;
		}
	}
	

	private Map<String, String> deleteEndpointFromRemoteVM(String datasourceName, String org, String endpointId) {
		ICIPDatasource datasource = dsService.getDatasource(datasourceName, org);
		Map<String, String> headers = new HashMap<>();
		headers.put(ICIPPluginConstants.REFERER_TITLE_CASE, referer);
		Map<String, String> params = new HashMap<>();
		params.put(ICIPPluginConstants.IS_REMOTE_DS, ICIPPluginConstants.TRUE);
		params.put(ICIPPluginConstants.IS_CACHED, ICIPPluginConstants.FALSE_STRING);
		params.put(ICIPPluginConstants.ADAPTER_INSTANCE, datasourceName);
		params.put(ICIPPluginConstants.PROJECT, org);
		params.put(ICIPPluginConstants.ENDPOINT_ID, endpointId);
		ICIPDataset datasetForRemote = new ICIPDataset();
		datasetForRemote.setOrganization(org);
		String headerArray = getJsonArrayFromMap(headers).toString();
		String paramsArray = getJsonArrayFromMap(params).toString();
		JSONObject jSONObjectAttrs = new JSONObject();
		jSONObjectAttrs.put(ICIPPluginConstants.URL, ICIPPluginConstants.MLOPS_APIS.get("projects_endpoints_delete"));
		jSONObjectAttrs.put(ICIPPluginConstants.REQUEST_METHOD, ICIPPluginConstants.REQUEST_METHOD_DELETE);
		String ars = jSONObjectAttrs.toString();
		datasetForRemote.setAttributes(ars);
		JSONObject attributes = new JSONObject(datasetForRemote.getAttributes())
				.put(ICIPPluginConstants.PATH_VARIABLES, paramsArray).put(ICIPPluginConstants.HEADERS, headerArray)
				.put(ICIPPluginConstants.QUERY_PARAMS, paramsArray);
		datasetForRemote.setAttributes(attributes.toString());
		datasource.setType(ICIPPluginConstants.REST);
		datasetForRemote.setDatasource(datasource);
		datasetForRemote.setType(ICIPPluginConstants.REST);
		Map<String, String> res = new HashMap<>();
		try {
			String results = getResult(
					Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)),
					params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10), null, -1,
					datasetForRemote);
			if (results.startsWith("{")) {
				res.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_SUCCESS);
				res.put(ICIPPluginConstants.RESPONSE, results);
				return res;
			} else {
				res.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_FAILED);
				return res;
			}
		} catch (Exception e) {
			logger.info("error due to:{}", e.getMessage());
			res.put(ICIPPluginConstants.MESSAGE, ICIPPluginConstants.MESSAGE_FAILED);
			return res;
		}
	}

	
	@Override
	public ICIPPolyAIResponseWrapper deleteEndpoint(ICIPPolyAIRequestWrapper request)
			throws IOException, EssedumException {
		ICIPPolyAIResponseWrapper modelObj = new ICIPPolyAIResponseWrapper();
		ICIPMLFederatedEndpoint dto = new ICIPMLFederatedEndpoint();
		FedEndpointID fedendpointid = new FedEndpointID();
		fedendpointid.setAdapterId(request.getName());
		fedendpointid.setSourceId(request.getBody());
		fedendpointid.setOrganisation(request.getOrganization());
		Optional<ICIPMLFederatedEndpoint> modObj = fedEndpointRepo.findById(fedendpointid);
		if (modObj.isPresent()) {
			dto = modObj.get();
			Map<String, String> responseFromVM = deleteEndpointFromRemoteVM(fedendpointid.getAdapterId(),
					fedendpointid.getOrganisation(), fedendpointid.getSourceId());
			if (ICIPPluginConstants.MESSAGE_SUCCESS.equalsIgnoreCase(responseFromVM.get(ICIPPluginConstants.MESSAGE))) {
				fedEndpointRepo.delete(dto);
				modelObj.setResponse(responseFromVM.get(ICIPPluginConstants.RESPONSE));
				modelObj.setType(ICIPPluginConstants.VM_SUCCESS);
				return modelObj;
			} else {
				modelObj.setResponse(responseFromVM.get(ICIPPluginConstants.RESPONSE));
				modelObj.setType(ICIPPluginConstants.VM_FAILED);
				return modelObj;
			}

		}
		modelObj.setResponse("Failed! Endpoint Not Found in Database");
		modelObj.setType(ICIPPluginConstants.VM_FAILED);
		return modelObj;
	}
	

	@Override
	public ICIPPolyAIResponseWrapper deployModel(ICIPPolyAIRequestWrapper request) throws IOException {
		String reqBody = request.getBody();
		Boolean isRemoteVMexecutionRequired = false;
		ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
		if (!ICIPPluginConstants.REST.equalsIgnoreCase(datasource.getType())) {
			JSONObject connectionDetails = new JSONObject(datasource.getConnectionDetails());
			String executionEnvironment = connectionDetails.optString(ICIPPluginConstants.EXECUTION_ENVIRONMENT);
			if (ICIPPluginConstants.REMOTE.equalsIgnoreCase(executionEnvironment)) {
				isRemoteVMexecutionRequired = true;
				logger.info("Found Remote exec conn: {}", datasource.getAlias());
			}
		}
		if (isRemoteVMexecutionRequired) {
			return this.deployModelFromRemoteVM(datasource, reqBody);
		}
		return null;
	}

	
	private ICIPPolyAIResponseWrapper deployModelFromRemoteVM(ICIPDatasource datasource, String reqBody) {
		Map<String, String> headers = new HashMap<>();
		ICIPPolyAIResponseWrapper modelFromVm = new ICIPPolyAIResponseWrapper();
		JSONObject reqJsonObj = new JSONObject(reqBody);
		headers.put(ICIPPluginConstants.REFERER_TITLE_CASE, referer);
		headers.put("Content-Type", "application/json");
		Map<String, String> params = new HashMap<>();
		params.put(ICIPPluginConstants.IS_REMOTE_DS, ICIPPluginConstants.TRUE);
		params.put(ICIPPluginConstants.IS_CACHED, ICIPPluginConstants.FALSE_STRING);
		params.put(ICIPPluginConstants.ADAPTER_INSTANCE, datasource.getName());
		params.put(ICIPPluginConstants.PROJECT, datasource.getOrganization());
		params.put("endpoint_id", reqJsonObj.optString("EndpointId"));
		ICIPDataset datasetForRemote = new ICIPDataset();
		datasetForRemote.setOrganization(datasource.getOrganization());
		String headerArray = getJsonArrayFromMap(headers).toString();
		String paramsArray = getJsonArrayFromMap(params).toString();

		Map<String, Object> bodyMap = getBodyForDeployModel(reqJsonObj);
		String body = JSONObject.valueToString(bodyMap);

		JSONObject jSONObjectAttrs = new JSONObject();
		jSONObjectAttrs.put(ICIPPluginConstants.BODY, body);
		jSONObjectAttrs.put(ICIPPluginConstants.URL,
				ICIPPluginConstants.MLOPS_APIS.get("projects_endpoints_deploy_model_create"));
		jSONObjectAttrs.put(ICIPPluginConstants.REQUEST_METHOD, ICIPPluginConstants.REQUEST_METHOD_POST);
		String ars = jSONObjectAttrs.toString();
		datasetForRemote.setAttributes(ars);
		JSONObject attributes = new JSONObject(datasetForRemote.getAttributes())
				.put(ICIPPluginConstants.PATH_VARIABLES, paramsArray).put(ICIPPluginConstants.HEADERS, headerArray)
				.put(ICIPPluginConstants.QUERY_PARAMS, paramsArray);
		datasetForRemote.setAttributes(attributes.toString());
		datasource.setType(ICIPPluginConstants.REST);
		datasetForRemote.setDatasource(datasource);
		datasetForRemote.setType(ICIPPluginConstants.REST);
		try {
			JSONObject responseJsonObj = null;
			String results = getResult(
					Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)),
					params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10), null, -1,
					datasetForRemote);
			if (results != null && !results.isEmpty() && results.startsWith("{")) {
				responseJsonObj = new JSONObject(results);
				String body2 = JSONObject.valueToString(responseJsonObj);
				modelFromVm.setResponse(body2);
			} else {
				modelFromVm.setResponse(results);
				return modelFromVm;
			}
			return modelFromVm;
		} catch (Exception e) {
			logger.info("error due to:{}", e.getMessage());
			modelFromVm.setResponse("Some error occured while trying to deploying Model");
			return modelFromVm;
		}
	}

	public Map<String, Object> getBodyForDeployModel(JSONObject reqJsonObj) {

		Map<String, Object> bodyMap = new HashMap<>();
		bodyMap.put("model_name", reqJsonObj.optString("Model Name"));
		bodyMap.put("compute_target", reqJsonObj.optString("Compute Target"));
		bodyMap.put("mini_batch", reqJsonObj.optString("Mini Batch"));
		bodyMap.put("model_version", reqJsonObj.optString("Model Version"));
		bodyMap.put("deployment_name", reqJsonObj.optString("Deployment Name"));
		return bodyMap;
	}

	@Override
	public ICIPPolyAIResponseWrapper getModelEndpointDetails(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper deleteDeployment(ICIPPolyAIRequestWrapper request)
			throws IOException, EssedumException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper listEndpoints(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper getEndpoint(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper getDeploymentStatus(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public JSONObject getDeployModelJson() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper updateDeployment(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper createModelDeployment(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper listRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper getRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

}
