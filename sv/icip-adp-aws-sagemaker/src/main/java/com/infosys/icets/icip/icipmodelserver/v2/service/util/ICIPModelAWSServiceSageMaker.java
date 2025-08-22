package com.infosys.icets.icip.icipmodelserver.v2.service.util;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;

//import com.amazonaws.auth.AWSStaticCredentialsProvider;
import software.amazon.awssdk.auth.credentials.*;

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
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.dataset.constants.ICIPPluginConstants;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil.DATATYPE;
import com.infosys.icets.icip.dataset.service.util.IICIPDataSetServiceUtil.SQLPagination;
import com.infosys.icets.icip.icipmodelserver.v2.model.dto.ICIPPolyAIRequestWrapper;
import com.infosys.icets.icip.icipmodelserver.v2.model.dto.ICIPPolyAIResponseWrapper;
import com.infosys.icets.icip.icipwebeditor.job.model.Containers;
import com.infosys.icets.icip.icipwebeditor.job.model.EndPointBody;
import com.infosys.icets.icip.icipwebeditor.job.model.EndpointConfiguration;
import com.infosys.icets.icip.icipwebeditor.job.model.ModelBody;
import com.infosys.icets.icip.icipwebeditor.model.FedEndpointID;
import com.infosys.icets.icip.icipwebeditor.model.FedModelsID;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPMLFederatedEndpointDTO;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLFederatedEndpointRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPMLFederatedEndpointService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPMLFederatedModelService;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sagemaker.SageMakerClient;
import software.amazon.awssdk.services.sagemaker.model.ContainerDefinition;
import software.amazon.awssdk.services.sagemaker.model.CreateEndpointConfigRequest;
import software.amazon.awssdk.services.sagemaker.model.CreateEndpointConfigResponse;
import software.amazon.awssdk.services.sagemaker.model.CreateEndpointRequest;
import software.amazon.awssdk.services.sagemaker.model.CreateEndpointResponse;
import software.amazon.awssdk.services.sagemaker.model.CreateModelRequest;
import software.amazon.awssdk.services.sagemaker.model.CreateModelResponse;
import software.amazon.awssdk.services.sagemaker.model.DeleteEndpointRequest;
import software.amazon.awssdk.services.sagemaker.model.DeleteEndpointResponse;
import software.amazon.awssdk.services.sagemaker.model.DeleteModelRequest;
import software.amazon.awssdk.services.sagemaker.model.DeleteModelResponse;
import software.amazon.awssdk.services.sagemaker.model.DescribeEndpointRequest;
import software.amazon.awssdk.services.sagemaker.model.DescribeEndpointResponse;
import software.amazon.awssdk.services.sagemaker.model.DescribeModelRequest;
import software.amazon.awssdk.services.sagemaker.model.DescribeModelResponse;
import software.amazon.awssdk.services.sagemaker.model.EndpointSummary;
import software.amazon.awssdk.services.sagemaker.model.ListEndpointsRequest;
import software.amazon.awssdk.services.sagemaker.model.ListEndpointsResponse;
import software.amazon.awssdk.services.sagemaker.model.ListModelsRequest;
import software.amazon.awssdk.services.sagemaker.model.ListModelsResponse;
import software.amazon.awssdk.services.sagemaker.model.ModelSummary;
import software.amazon.awssdk.services.sagemaker.model.ProductionVariant;
import software.amazon.awssdk.services.sagemaker.model.SageMakerException;
import software.amazon.awssdk.services.sagemaker.model.UpdateEndpointRequest;
import software.amazon.awssdk.services.sagemaker.model.UpdateEndpointResponse;

@Component("awssagemakermodelservice")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPModelAWSServiceSageMaker implements IICIPModelServiceUtil {
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPModelAWSServiceSageMaker.class);

	@Autowired
	private IICIPDatasourceService dsService;

	@Autowired
	private ICIPMLFederatedModelService fedModelService;
	
	@Autowired
	private ICIPMLFederatedEndpointService fedEndpointService;
	
	@Autowired
	private ICIPMLFederatedEndpointRepository fedEndpointRepo;

	/** The plugin service. */
	@Autowired
	private ICIPDatasetPluginsService pluginService;

	@Autowired
	private ICIPMLFederatedModelsRepository fedModelRepo;

	/** The leap url. */
	@Value("${LEAP_ULR}")
	private String referer;

	/*
	 * -----------------------------------------------------------------------------
	 * ------------------------------------------ This Method is used to set the
	 * body Required Bodies
	 *
	 */
	public JSONObject modelBody(String reqBody) {
		JSONObject requestBody = new JSONObject(reqBody);

		/*
		 * String containerKey = requestBody.getString("Containers"); JSONArray
		 * containersArray = new JSONArray(containerKey); JSONObject containerObject =
		 * containersArray.getJSONObject(0);
		 */

		/*
		 * JSONObject envJSONObj = containerObject.getJSONObject("Environment");
		 * Environment env = new Environment();
		 * env.setAUTOML_SPARSE_ENCODE_RECORDIO_PROTOBUF(envJSONObj.getString(
		 * "AUTOML_SPARSE_ENCODE_RECORDIO_PROTOBUF"));
		 * env.setSAGEMAKER_DEFAULT_INVOCATIONS_ACCEPT(envJSONObj.getString(
		 * "SAGEMAKER_DEFAULT_INVOCATIONS_ACCEPT"));
		 * env.setSAGEMAKER_PROGRAM(envJSONObj.getString("SAGEMAKER_PROGRAM"));
		 * env.setSAGEMAKER_SUBMIT_DIRECTORY(envJSONObj.getString(
		 * "SAGEMAKER_SUBMIT_DIRECTORY")); JSONObject envJSON = new JSONObject(env);
		 */
		JSONObject envJSON = new JSONObject();
		JSONArray envArray = new JSONArray();
		envArray = requestBody.getJSONArray("env");
		for (int i = 0; i < envArray.length(); i++) {
			JSONObject envObj = envArray.getJSONObject(i);
			envJSON.put(envObj.getString("EnvVariable Name"), envObj.getString("EnvVariable Value"));
		}
		Containers container = new Containers();
		container.setImage(requestBody.getString("Image"));
		container.setModelDataUrl(requestBody.getString("ModelDataUrl"));
		container.setContainerHostname(requestBody.getString("ContainerHostname"));
		container.setMode(requestBody.getString("Mode"));
		container.setEnvironment(envJSON);
		JSONObject containerJSON = new JSONObject(container);
		JSONArray containers = new JSONArray();
		containers.put(containerJSON);

		ModelBody modelBody = new ModelBody();
		modelBody.setExecutionRoleArn(requestBody.getString("ExecutionRoleArn"));
		modelBody.setModelName(requestBody.getString("ModelName"));
		modelBody.setContainers(containers);

		JSONObject requiredBody = new JSONObject(modelBody);

		return requiredBody;

	}
	/*
	 * This Method returns endPointBody to deploy model
	 */

	public JSONObject deployModel(String reqBody) {
		JSONObject requestBody = new JSONObject(reqBody);
		EndPointBody endpointBody = new EndPointBody();
		endpointBody.setEndpointName(requestBody.getString("EndpointName"));
		endpointBody.setEndpointConfigName(requestBody.getString("EndpointConfigName"));

		JSONObject epBody = new JSONObject(endpointBody);

		return epBody;
	}

	/*
	 * This method is for Endpoint Configuration
	 */

	public JSONObject endpointConfiguration(String reqBody) {
		JSONObject requestBody = new JSONObject(reqBody);
		EndpointConfiguration endpointConfig = new EndpointConfiguration();
		endpointConfig.setModelName(requestBody.optString("modelName"));
		endpointConfig.setEndpointConfigName(requestBody.getString("endpointConfigName"));
		endpointConfig.setVariantName(requestBody.getString("variantName"));
		endpointConfig.setInitialInstanceCount(requestBody.getInt("initialInstanceCount"));
		endpointConfig.setInstanceType(requestBody.getString("instanceType"));

		JSONObject epConfigJSON = new JSONObject(endpointConfig);
		return epConfigJSON;
	}

	/*
	 * This Method is returning SageMakerClient and AWS Credentials
	 */

	public SageMakerClient sageMakerClient(String datasourceName, String org) {
		// Credentials cred = new Credentials();
		ICIPDatasource datasource = dsService.getDatasource(datasourceName, org);
		JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
		JSONObject authDetails = new JSONObject(connDetails.optString("AuthDetails"));
		Region region = Region.of(authDetails.getString("region"));

		// Create a SageMaker client and AWS Credential Provider
		SageMakerClient sageMakerClient = SageMakerClient.builder().region(region)
				.credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials
						.create(authDetails.optString("accesskey"), authDetails.optString("secretkey"))))
				.build();

		return sageMakerClient;

	}

	// ------------------------------- Model Starts
	// ------------------------------------------------

	/*
	 * 
	 * This Method is defined for Register/Create Model
	 */
	@Override
	public ICIPMLFederatedModel registerModel(ICIPPolyAIRequestWrapper request) throws IOException, LeapException {
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
		String reqBody = request.getBody();
		// Calling Method that contains required details
		JSONObject body = modelBody(reqBody);

		JSONArray containerKey = (JSONArray) body.get("containers");
		// this JSONObject contains image and modeDataUrl
		JSONObject containerObject = containerKey.getJSONObject(0);
		JSONObject en = containerObject.getJSONObject("environment");
		Map<String, String> env = new HashMap<>();
		for (String key : en.keySet()) {
			String value = en.getString(key);
			env.put(key, value);
		}

		// Create the container definition
		ContainerDefinition containerDefinition = ContainerDefinition.builder()
				.containerHostname(containerObject.getString("containerHostname")).environment(env)
				.image(containerObject.getString("image")).modelDataUrl(containerObject.getString("modelDataUrl"))
				.mode(containerObject.getString("mode")).build();

		ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
		ICIPMLFederatedModel saveModel = null;
		CreateModelResponse createModelResponse = null;
		CreateModelRequest createModelRequest;
		try {
			// Request
			createModelRequest = CreateModelRequest.builder().modelName(body.getString("modelName"))
					.executionRoleArn(body.getString("executionRoleArn")).containers(containerDefinition)

					.build();

			// Response

			createModelResponse = sageMakerClient(request.getName(), request.getOrganization())
					.createModel(createModelRequest);

			
			ICIPPolyAIRequestWrapper payload = new ICIPPolyAIRequestWrapper();
			JSONObject content = new JSONObject();
			content.put("datasource", request.getName());
			content.put("org", request.getOrganization());
			payload.setRequest(content.toString());
			ICIPPolyAIResponseWrapper response = this.listRegisteredModel(payload);
			String str = response.getResponse();
			JSONObject resJSON = new JSONObject(str);
			JSONArray modelsArray = resJSON.getJSONArray("Models");
			JSONObject listJSON = new JSONObject();
			for (int i = 0; i < modelsArray.length(); i++) {
				JSONObject jsonObj = modelsArray.getJSONObject(i);
				if (jsonObj.getString("ModelArn").equals(createModelResponse.modelArn().toString())) {
					listJSON = jsonObj;
					break;
				}

			}

			saveModel = parseMLFedModel(listJSON, request.getName(), datasource.getAlias(), request.getOrganization());
		} catch (SageMakerException e) {
			logger.error("Exception: " + e.awsErrorDetails().errorMessage());
			throw new LeapException(e.awsErrorDetails().errorMessage());
		} catch (JSONException e) {
			logger.error("Exception:" + e.getMessage());
		} catch (ParseException e) {
			logger.error("Exception:" + e.getMessage());
		}
		sageMakerClient(request.getName(), request.getOrganization()).close();
		
		return saveModel;
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
			if (results != null && !results.isEmpty() && results.startsWith("{")) {
				responseJsonObj = new JSONObject(results);
			} else {
				
				return modelFromVm;
			}
			modelFromVm = parseMLFedModel(responseJsonObj, datasource, datasource.getOrganization());
			return modelFromVm;
		} catch (Exception e) {
			logger.info("error due to:{}", e.getMessage());
			return modelFromVm;
		}
	}
	
	public Map<String, Object> getModelBodyForRegister(String reqBody) {
		JSONObject requestBody = new JSONObject(reqBody);
		Map<String, Object> bodyMap = new HashMap<>();
		JSONObject reqJsonObj = new JSONObject(reqBody);
		bodyMap.put("ExecutionRoleArn", reqJsonObj.optString("ExecutionRoleArn"));
		bodyMap.put("ModelName", reqJsonObj.optString("ModelName"));
		List<Map<String, Object>> containerList = new ArrayList<>();
		Map<String, Object> containerMap = new HashMap<>();
		containerMap.put("ContainerHostname", reqJsonObj.optString("ContainerHostname"));
		containerMap.put("Image", reqJsonObj.optString("Image"));
		containerMap.put("Mode", reqJsonObj.optString("Mode"));
		containerMap.put("ModelDataUrl", reqJsonObj.optString("ModelDataUrl"));
		JSONObject envJSON = new JSONObject();
		JSONArray envArray = new JSONArray();
		envArray = requestBody.getJSONArray("env");
		for (int i = 0; i < envArray.length(); i++) {
			JSONObject envObj = envArray.getJSONObject(i);
			envJSON.put(envObj.optString("EnvVariable Value"), envObj.optString("EnvVariable Name"));
		}
		containerMap.put("Environment", envJSON);
		containerList.add(containerMap);
		bodyMap.put("Containers", containerList);
		return bodyMap;
	}

	public Map<String, Object> getBodyObjForEndpointsRegister(String reqBody, ICIPDatasource datasource) {
		JSONObject reqJsonObj = new JSONObject(reqBody);
		Map<String, Object> bodyMap = new HashMap<>();
		bodyMap.put("ExecutionRoleArn", reqJsonObj.optString("ExecutionRoleArn"));
		bodyMap.put("ModelName", reqJsonObj.optString("ModelName"));
		bodyMap.put("VariantName", reqJsonObj.optString("VariantName"));
		bodyMap.put("InitialInstanceCount", reqJsonObj.optInt("InitialInstanceCount"));
		bodyMap.put("InstanceType", reqJsonObj.optString("InstanceType"));
		bodyMap.put("EndpointConfigName", reqJsonObj.optString("EndpointConfigName"));
		Map<String, Object> containerMap = new HashMap<>();
		containerMap.put("Image", reqJsonObj.optString("Image"));
		containerMap.put("ModelDataUrl", reqJsonObj.optString("ModelDataUrl"));
		bodyMap.put("PrimaryContainer", containerMap);
		return bodyMap;
	}
	/*
	 * This is List Registered Model
	 */

	@Override
	public ICIPPolyAIResponseWrapper listRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException {
		JSONObject requestJSON = new JSONObject(request.getRequest());

		// Calling Method that contains required detail
		// JSONObject body = modelBody(reqBody);

		ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();

		try {
			// Request
			ListModelsRequest modelsRequest = ListModelsRequest.builder().build();
			// Response
			ListModelsResponse modelResponse = sageMakerClient(requestJSON.getString("datasource"),
					requestJSON.getString("org")).listModels(modelsRequest);

			List<ModelSummary> items = modelResponse.models();

			JSONArray js = new JSONArray();

			for (ModelSummary model : items) {
				JSONObject jsonOb = new JSONObject();
				jsonOb.put("ModelName", model.modelName());
				jsonOb.put("ModelArn", model.modelArn());
				jsonOb.put("CreationTime", model.creationTime());

				js.put(jsonOb);
			}
			JSONObject bigJson = new JSONObject();
			bigJson.put("Models", js);
			bigJson.put("NextToken", modelResponse.nextToken());

			wrapResponse.setResponse(bigJson.toString());
		} catch (SageMakerException e) {
			logger.error("Exception : " + e.awsErrorDetails().errorMessage());
			System.exit(1);
		}
		sageMakerClient(requestJSON.getString("datasource"), requestJSON.getString("org")).close();
		wrapResponse.setType("AWSSAGEMAKER");
		return wrapResponse;
	}

	/*
	 * This is Describe Model/getRegisteredModel
	 */

	@Override
	public ICIPPolyAIResponseWrapper getRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		// describe model
		String reqBody = request.getBody();

		// calling method that contains required details
		JSONObject body = modelBody(reqBody);

		ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
		try {
			// Request
			DescribeModelRequest describeModelRequest = DescribeModelRequest.builder()
					.modelName(body.getString("modelName")).build();

			// This is describe model response
			DescribeModelResponse describeModelResponse = sageMakerClient(request.getName(), request.getOrganization())
					.describeModel(describeModelRequest);
			wrapResponse.setResponse(describeModelResponse.toString());
		} catch (SageMakerException e) {
			logger.error("Exception : " + e.awsErrorDetails().errorMessage());
			System.exit(1);
		}
		sageMakerClient(request.getName(), request.getOrganization()).close();
		wrapResponse.setType("AWSSAGEMAKER");
		return wrapResponse;
	}

	/*
	 * Delete Model
	 */

	@Override
	public ICIPPolyAIResponseWrapper deleteDeployment(ICIPPolyAIRequestWrapper request) throws IOException {
		String reqBody = request.getBody();
		// Calling Method that contains required details
		JSONObject body = modelBody(reqBody);

		ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
		try {
			// this is request
			DeleteModelRequest deleteModelRequest = DeleteModelRequest.builder().modelName(body.getString("modelName"))
					.build();
			// this is response
			DeleteModelResponse response = sageMakerClient(request.getName(), request.getOrganization())
					.deleteModel(deleteModelRequest);

			wrapResponse.setResponse(String.valueOf(response.sdkHttpResponse().isSuccessful()));
		} catch (SageMakerException e) {
			logger.error("Exception : " + e.awsErrorDetails().errorMessage());
			System.exit(1);
		}
		sageMakerClient(request.getName(), request.getOrganization()).close();
		wrapResponse.setType("AWSSAGEMAKER");
		return wrapResponse;
	}

	@Override
	public JSONObject getJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "AWSSAGEMAKER");
			JSONObject attributes = new JSONObject();
			ds.put("attributes", attributes);
			JSONObject position = new JSONObject();
			ds.put("position", position);
		} catch (JSONException e) {
			logger.error("Exception", e);
		}
		return ds;
	}

//------------------------Model Ends------------------------------------------

//---------------------Endpoint Starts --------------------------------------------------

	/*
	 * This is used to Create Endpoint
	 */
	@Override
	public ICIPMLFederatedEndpoint createEndpoint(ICIPPolyAIRequestWrapper request) throws IOException, LeapException {
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
		// Calling Method that contains required details
		JSONObject body = deployModel(reqBody);

		// ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
		ICIPMLFederatedEndpoint saveModel = null;

		try {
			// request
			CreateEndpointRequest createEndpointRequest = CreateEndpointRequest.builder()
					.endpointName(body.optString("endpointName"))
					.endpointConfigName(body.optString("endpointConfigName")).build();
			// Response
			CreateEndpointResponse createEndpointResponse = sageMakerClient(request.getName(),
					request.getOrganization()).createEndpoint(createEndpointRequest);

			// wrapResponse.setResponse(createEndpointResponse.endpointArn().toString());
           int statusCode= createEndpointResponse.sdkHttpResponse().statusCode();
			ICIPPolyAIRequestWrapper payload = new ICIPPolyAIRequestWrapper();
			JSONObject content = new JSONObject();
			content.put("datasource", request.getName());
			content.put("org", request.getOrganization());
			payload.setRequest(content.toString());
			ICIPPolyAIResponseWrapper response = this.listEndpoints(payload);
			String str = response.getResponse();
			JSONObject resJSON = new JSONObject(str);
			JSONArray endpointArray = resJSON.getJSONArray("Endpoints");
			JSONObject listJSON = new JSONObject();
			for (int i = 0; i < endpointArray.length(); i++) {
				JSONObject jsonObj = endpointArray.getJSONObject(i);
				if (jsonObj.getString("EndpointArn").equals(createEndpointResponse.endpointArn().toString())) {
					listJSON = jsonObj;
					break;
				}
			}

			try {
				saveModel = parseFedEndpoint(listJSON, request.getName(), datasource.getAlias(),
						request.getOrganization());
			} catch (ParseException e) {
				logger.error("Exception:" + e.getMessage());
			}

		} catch (SageMakerException e) {
			throw new LeapException(e.awsErrorDetails().errorMessage());
		}
		sageMakerClient(request.getName(), request.getOrganization()).close();
		// wrapResponse.setType("AWSSAGEMAKER");
		return saveModel;
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
				modelFromVm.setSourceName(responseJsonObj.optString("name"));
				if (modelFromVm.getSourceName() == null || modelFromVm.getSourceName().isEmpty())
					modelFromVm.setSourceName(responseJsonObj.optString("sourcename"));
				modelFromVm.setAdapter(datasource.getName());
				modelFromVm.setType("AWSSAGEMAKER");
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

	/*
	 * Create EndPointconfiguration
	 */
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
		JSONObject body = endpointConfiguration(reqBody);

		ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();

		try {

			CreateEndpointConfigRequest endpointConfigRequest = CreateEndpointConfigRequest.builder()
					.endpointConfigName(body.getString("endpointConfigName"))
					.productionVariants(ProductionVariant.builder().variantName(body.getString("variantName"))
							.modelName(body.getString("modelName")).instanceType(body.getString("instanceType"))
							.initialInstanceCount(body.getInt("initialInstanceCount")).build())
					.build();

			CreateEndpointConfigResponse response = sageMakerClient(request.getName(), request.getOrganization())
					.createEndpointConfig(endpointConfigRequest);

			wrapResponse.setResponse(response.endpointConfigArn());
		} catch (SageMakerException e) {
			logger.error("Exception : " + e.awsErrorDetails().errorMessage());
			System.exit(1);
		}
		sageMakerClient(request.getName(), request.getOrganization()).close();
		wrapResponse.setType("AWSSAGEMAKER");
		return wrapResponse;
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
		params.put("endpoint_id", reqJsonObj.optString("EndpointName"));
		ICIPDataset datasetForRemote = new ICIPDataset();
		datasetForRemote.setOrganization(datasource.getOrganization());
		String headerArray = getJsonArrayFromMap(headers).toString();
		String paramsArray = getJsonArrayFromMap(params).toString();
		Map<String, Object> bodyMap = new HashMap<>();
		bodyMap.put("EndpointConfigName", reqJsonObj.optString("EndpointConfigName"));
		bodyMap.put("EndpointName", reqJsonObj.optString("EndpointName"));
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
	/*
	 * This is Update Deployment Model :changes needed
	 */
	@Override
	public ICIPPolyAIResponseWrapper updateDeployment(ICIPPolyAIRequestWrapper request) throws IOException {
		String reqBody = request.getBody();

		// Calling Method that contains required details
		JSONObject body = deployModel(reqBody);

		ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
		try {
			// This is request
			UpdateEndpointRequest updateEndpointRequest = UpdateEndpointRequest.builder()
					.endpointName(body.optString("endpointName"))
					.endpointConfigName(body.optString("endpointConfigName")).build();

			// This is response
			UpdateEndpointResponse updateEndpointResponse = sageMakerClient(request.getName(),
					request.getOrganization()).updateEndpoint(updateEndpointRequest);

			wrapResponse.setResponse(updateEndpointResponse.endpointArn().toString());
		} catch (SageMakerException e) {
			logger.error("Exception: " + e.awsErrorDetails().errorMessage());
			System.exit(1);
		}
		sageMakerClient(request.getName(), request.getOrganization()).close();
		wrapResponse.setType("AWSSAGEMAKER");
		return wrapResponse;

	}

	/*
	 * This is Describe EndPoint Method
	 */

	@Override
	public ICIPPolyAIResponseWrapper getModelEndpointDetails(ICIPPolyAIRequestWrapper request) throws IOException {
		String reqBody = request.getBody();

		// Calling Method that contains required details
		JSONObject body = deployModel(reqBody);

		ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
		try {
			// this is request
			DescribeEndpointRequest describeEndpointRequest = DescribeEndpointRequest.builder()
					.endpointName(body.optString("endpointName")).build();
			// this is response
			DescribeEndpointResponse describeEndpointResponse = sageMakerClient(request.getName(),
					request.getOrganization()).describeEndpoint(describeEndpointRequest);
			wrapResponse.setResponse(describeEndpointResponse.toString());
		} catch (SageMakerException e) {
			logger.error("Exception : " + e.awsErrorDetails().errorMessage());
			System.exit(1);

		}
		sageMakerClient(request.getName(), request.getOrganization()).close();
		wrapResponse.setType("AWSSAGEMAKER");
		return wrapResponse;
	}

	// List endpoints
	@Override
	public ICIPPolyAIResponseWrapper listEndpoints(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		JSONObject requestJSON = new JSONObject(request.getRequest());
		// String reqBody = request.getBody();

		// Calling Method that contains required detail
		// JSONObject body = modelBody(reqBody);

		ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();

		try {
			ListEndpointsRequest listEndpointsRequest = ListEndpointsRequest.builder().maxResults(15).build();

			ListEndpointsResponse listEndpointsResponse = sageMakerClient(requestJSON.getString("datasource"),
					requestJSON.getString("org")).listEndpoints(listEndpointsRequest);
			List<EndpointSummary> items = listEndpointsResponse.endpoints();

			JSONArray js = new JSONArray();

			for (EndpointSummary endpoint : items) {
				JSONObject jsonOb = new JSONObject();
				jsonOb.put("CreationTime", endpoint.creationTime());
				jsonOb.put("EndpointArn", endpoint.endpointArn());
				jsonOb.put("EndpointName", endpoint.endpointName());
				jsonOb.put("EndpointStatus", endpoint.endpointStatus());
				jsonOb.put("LastModifiedTime", endpoint.lastModifiedTime());

				js.put(jsonOb);
			}
			JSONObject bigJson = new JSONObject();
			bigJson.put("Endpoints", js);
			bigJson.put("NextToken", listEndpointsResponse.nextToken());
			wrapResponse.setResponse(bigJson.toString());
		} catch (SageMakerException e) {
			logger.error("Exception : " + e.awsErrorDetails().errorMessage());
			System.exit(1);

		}
		sageMakerClient(requestJSON.getString("datasource"), requestJSON.getString("org")).close();
		wrapResponse.setType("AWSSAGEMAKER");
		return wrapResponse;
	}

	/*
	 * This is Delete Deployment Method
	 */

	@Override
	public ICIPPolyAIResponseWrapper deleteEndpoint(ICIPPolyAIRequestWrapper request) throws IOException, LeapException {
		String reqBody = request.getBody();
		// Calling Method that contains required details
		//JSONObject body = deployModel(reqBody);

		ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
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
				if (ICIPPluginConstants.MESSAGE_SUCCESS
						.equalsIgnoreCase(responseFromVM.get(ICIPPluginConstants.MESSAGE))) {
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
		try {
			// this is request
			DeleteEndpointRequest deleteEndpointRequest = DeleteEndpointRequest.builder()
					.endpointName(reqBody).build();
			// this is response
			DeleteEndpointResponse deleteEndpointResponse = sageMakerClient(request.getName(),
					request.getOrganization()).deleteEndpoint(deleteEndpointRequest);
			if (deleteEndpointResponse.sdkHttpResponse().statusCode()==200) {
				ICIPMLFederatedEndpointDTO endpointDto = new ICIPMLFederatedEndpointDTO();
				endpointDto.setAdapterId(request.getName());
				endpointDto.setSourceId(reqBody);
				endpointDto.setOrganisation(request.getOrganization());
				fedEndpointService.updateIsDelEndpoint(endpointDto);
				wrapResponse.setResponse("The Endpoint has been deleted");
			}
			else {
				wrapResponse.setResponse("endpoint is either already deleted or does not exist");		
				}
             
		} catch (SageMakerException e) {
			throw new LeapException(e.awsErrorDetails().errorMessage());
		}
		sageMakerClient(request.getName(), request.getOrganization()).close();
		wrapResponse.setType("AWSSAGEMAKER");
		return wrapResponse;
	}

	/*
	 * This is EndPoint configuration
	 */
	@Override
	public JSONObject getDeployModelJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "AWSSAGEMAKER");

			JSONObject attributes = new JSONObject();
			attributes.put("endpointConfigName", "");
			attributes.put("modelName", "");
			attributes.put("instanceType", "");
			attributes.put("initialInstanceCount", "");
			attributes.put("variantName", "");
			ds.put("attributes", attributes);
			JSONObject attributesForVM = new JSONObject();
			attributesForVM.put("EndpointName", "");
			attributesForVM.put("EndpointConfigName", "");
			ds.put("attributesForVM", attributesForVM);

		} catch (Exception e) {
			logger.error("Exception : " + e);

		}

		return ds;
	}

	@Override
	public JSONObject getRegisterModelJson() {
		// TODO Auto-generated method stub
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "AWSSAGEMAKER");
			JSONObject attributes = new JSONObject();
			attributes.put("type", "object");

			JSONObject properties = new JSONObject();
			properties.put("ExecutionRoleArn", new JSONObject().put("type", "string").put("pattern",
					"^arn:aws[a-z\\-]*:iam::\\d{12}:role/?[a-zA-Z_0-9+=,.@\\-_/]+$"));
			properties.put("ModelName",
					new JSONObject().put("type", "string").put("pattern", "^[a-zA-Z0-9](-*[a-zA-Z0-9])*"));

			properties.put("ContainerHostname", new JSONObject().put("type", "string"));
			properties.put("Image", new JSONObject().put("type", "string"));
			properties.put("Mode", new JSONObject().put("type", "string"));
			properties.put("ModelDataUrl", new JSONObject().put("type", "string"));

//          env_items as pair in json form
			JSONObject env = new JSONObject().put("type", "array");
			JSONObject env_items = new JSONObject().put("type", "object");
			JSONObject env_properties = new JSONObject();
			env_properties.put("EnvVariable Name", new JSONObject().put("type", "string").put("minLength", 1));
			env_properties.put("EnvVariable Value", new JSONObject().put("type", "string").put("minLength", 1));
			env_items.put("properties", env_properties);
			env.put("items", env_items);
			properties.put("env", env);

			attributes.put("properties", properties);
			List<String> req = new ArrayList<String>();
			req.add("ExecutionRoleArn");
			req.add("ModelName");
			req.add("Containers");
			attributes.put("required", req);

			JSONObject uischema = new JSONObject();
			uischema.put("type", "VerticalLayout");
			JSONArray elements = new JSONArray();
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/ExecutionRoleArn"));
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/ModelName"));

			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Image"));
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Mode"));
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/ModelDataUrl"));
			elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/ContainerHostname"));
			JSONArray horizontalElements1 = new JSONArray();
			horizontalElements1.put(new JSONObject().put("type", "Control").put("scope", "#/properties/env"));
			elements.put(new JSONObject().put("type", "HorizontalLayout").put("elements", horizontalElements1));

			uischema.put("elements", elements);
			ds.put("attributes", attributes);
			ds.put("uischema", uischema);

		} catch (Exception e) {
			logger.error("Exception : " + e);
		}
		return ds;
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

	/*
	 * create endpoint
	 */
	@Override
	public JSONObject getEndpointJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", "AWSSAGEMAKER");

			JSONObject attributes = new JSONObject();
			attributes.put("EndpointName", "");
			attributes.put("EndpointConfigName", "");
			ds.put("attributes", attributes);
			JSONObject attributesForVM = new JSONObject();
			attributesForVM.put("EndpointConfigName", "");
			attributesForVM.put("ModelName", "");
			attributesForVM.put("InstanceType", "");
			attributesForVM.put("InitialInstanceCount", "");
			attributesForVM.put("VariantName", "");	
			attributesForVM.put("Image", "");	
			attributesForVM.put("ModelDataUrl", "");	
			attributesForVM.put("ExecutionRoleArn", "");	
			ds.put("attributesForVM", attributesForVM);
		} catch (Exception e) {
			logger.error("Exception : " + e);

		}

		return ds;
	}

	private ICIPMLFederatedModel parseMLFedModel(JSONObject jsonObj, String dsource, String dsrcAlias, String org)
			throws ParseException {
		ICIPMLFederatedModel dto = new ICIPMLFederatedModel();
		dto.setModelName(jsonObj.getString("ModelName"));
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");// 1.688643147483E9
		Date finishedTime = sdf.parse(jsonObj.getString("CreationTime"));
		Timestamp ts2 = new Timestamp(finishedTime.getTime());
		dto.setCreatedOn(ts2);
		dto.setCreatedBy("admin");
		FedModelsID fedmodid = new FedModelsID();
		dto.setModelType("AWSSAGEMAKER");
		Date date1 = new Date();
		return dto;
	}

	@Override
	public List<ICIPMLFederatedModel> getSyncModelList(ICIPPolyAIRequestWrapper request)
			throws IOException, ParseException {
		JSONObject requestJSON = new JSONObject(request.getRequest());
		String datasource = requestJSON.getString("datasource");
		String org = requestJSON.getString("org");
		String dsAlias = requestJSON.getString("datasourceAlias");
		String executionEnv = requestJSON.optString("executionEnvironment");
		if (executionEnv != null && !executionEnv.isEmpty()
				&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(executionEnv)) {
			return this.getModelsListFromRemoteVM(datasource, org);
		}
		ICIPPolyAIResponseWrapper response = this.listRegisteredModel(request);
		String str = response.getResponse();
		JSONObject resJSON = new JSONObject(str);
		String strArray = resJSON.getJSONArray("Models").toString();

		List<ICIPMLFederatedModel> resultList = new ArrayList<>();
		JSONArray resArray = new JSONArray(strArray);
		// String nextToken = resJSON.getString("NextToken");
		for (int i = 0; i < resArray.length(); i++) {
			JSONObject jsonObj = resArray.getJSONObject(i);
			ICIPMLFederatedModel dto = parseMLFedModel(jsonObj, datasource, dsAlias, org);
			resultList.add(dto);
		}
		return resultList;
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
			String results = getResult(
					Integer.parseInt(params.getOrDefault(ICIPPluginConstants.PAGE, ICIPPluginConstants.PAGE_0)),
					params.getOrDefault(ICIPPluginConstants.SIZE, ICIPPluginConstants.SIZE_10), null, -1,
					datasetForRemote);
			if (results.startsWith("[")) {
				JSONArray jsonArray = new JSONArray(results);
				for (int i = 0; i < jsonArray.length(); i++) {
					JSONObject jsonObject = jsonArray.getJSONObject(i);
					try {
						ICIPMLFederatedModel dto = parseMLFedModel(jsonObject, datasource, org);
						modelList.add(dto);
					} catch (Exception e) {
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

	private ICIPMLFederatedModel parseMLFedModel(JSONObject jsonObject, ICIPDatasource ds, String org)
			throws ParseException {
		ICIPMLFederatedModel dto = new ICIPMLFederatedModel();
		FedModelsID fedmodid = new FedModelsID();
		String srcId = jsonObject.optString("sourceId");
		if (srcId == null || srcId.isEmpty())
			srcId = jsonObject.optString("sourceID");
		fedmodid.setSourceId(srcId);
		fedmodid.setOrganisation(org);
		dto.setDatasource(ds.getName());
		ICIPMLFederatedModel modObj = fedModelRepo.findByDatasourceNameModelNameAndOrganisaton(jsonObject.getString("ModelName"), ds.getName(), org);
		Object description = jsonObject.get("description");
		if (modObj!=null) {
			dto = modObj;
		} else {
			dto.setModelName(jsonObject.optString("name"));
			dto.setDescription(description != null ? description.toString() : "");
		}
		String modifiedOn = jsonObject.optString("modifiedOn");
		Timestamp ts = null;
		try {
			if (modifiedOn != null && !modifiedOn.isEmpty()) {
				DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH-mm-ss");
				Date date = formatter.parse(modifiedOn);
				ts = new Timestamp(date.getTime());
			}
		} catch (Exception e) {
			logger.error("error while parsing modifiedOn:{}", e);
			try {
				DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
				Date date = formatter.parse(modifiedOn);
				ts = new Timestamp(date.getTime());
			} catch (Exception ex) {
				logger.error("error while parsing modifiedOn:{}", ex);
			}
		}
		Object value = jsonObject.get("artifacts");
		

		Object containerValue = jsonObject.get("container");
		
		dto.setCreatedBy(jsonObject.optString("createdBy"));
		String createdon = jsonObject.optString("createdOn");
		Timestamp ts2 = null;
		try {
			if (createdon != null && !createdon.isEmpty()) {
				DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH-mm-ss");
				Date date = formatter.parse(createdon);
				ts2 = new Timestamp(date.getTime());
				dto.setCreatedOn(ts2);
			}

		} catch (ParseException e) {
			logger.error("error while parsing createdOn:{}", e);
			try {
				DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
				Date date = formatter.parse(createdon);
				ts2 = new Timestamp(date.getTime());
				dto.setCreatedOn(ts2);
			} catch (Exception ex) {
				logger.error("error while parsing createdOn with Zone:{}", e);
			}
		}
		
		Date date1 = new Date();
		Timestamp ts1 = new Timestamp(date1.getTime());
		if (dto.getCreatedOn() == null)
			dto.setCreatedOn(ts1);
		Integer version = jsonObject.optInt("version");
		if (version != null)
			dto.setVersion(Integer.toString(version));
		else
		dto.setVersion("1");
		dto.setModelType("AWSSAGEMAKER");
		return dto;
	}

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

	private ICIPMLFederatedEndpoint parseFedEndpoint(JSONObject jsonObj, String dsource, String dsrcAlias, String org)
			throws ParseException {
		ICIPMLFederatedEndpoint dto = new ICIPMLFederatedEndpoint();
		dto.setSourceName(jsonObj.getString("EndpointName"));
		dto.setName(jsonObj.getString("EndpointName"));

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");// 1.688643147483E9
		Date finishedTime = sdf.parse(jsonObj.getString("LastModifiedTime"));
		Timestamp modTime = new Timestamp(finishedTime.getTime());
		dto.setSourceModifiedDate(modTime);
		// dto.setEndpointArn(jsonObj.getString("EndpointArn"));
        dto.setContextUri(jsonObj.getString("EndpointArn"));	
        dto.setStatus(jsonObj.getString("EndpointStatus"));
        dto.setSourcestatus(jsonObj.getString("EndpointStatus"));	
        SimpleDateFormat sdf2 = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");// 1.688643147483E9
		Date finishedTime2 = sdf2.parse(jsonObj.getString("CreationTime"));
		Timestamp ts2 = new Timestamp(finishedTime2.getTime());
		dto.setCreatedOn(ts2);
		dto.setAdapter(dsrcAlias);
		FedEndpointID fedendpointid = new FedEndpointID();
		fedendpointid.setAdapterId(dsource);
		fedendpointid.setOrganisation(org);
		fedendpointid.setSourceId(jsonObj.getString("EndpointName"));
		dto.setSourceEndpointId(fedendpointid);
      
		if(dto.getIsDeleted()==true){
		dto.setIsDeleted(true);
       }
       else {
    	   dto.setIsDeleted(false);
       }
        //dto.setType(jsonObj.getString("EndpointArn"));
		dto.setSourceOrg("NULL");
		Date date1 = new Date();
		Timestamp ts1 = new Timestamp(date1.getTime());
		dto.setSyncDate(ts1);
		dto.setRawPayload(jsonObj.toString());
		dto.setType("AWSSAGEMAKER");
		return dto;

	}

	@Override
	public List<ICIPMLFederatedEndpoint> getSyncEndpointList(ICIPPolyAIRequestWrapper payload)
			throws ParseException, JSONException {
		JSONObject requestJSON = new JSONObject(payload.getRequest());

		ICIPPolyAIResponseWrapper response;
		String datasource = requestJSON.getString("datasource");
		String org = requestJSON.getString("org");
		String datasourceAlias = requestJSON.getString("datasourceAlias");
		String executionEnv = requestJSON.optString("executionEnvironment");
		if (executionEnv != null && !executionEnv.isEmpty()
				&& ICIPPluginConstants.REMOTE.equalsIgnoreCase(executionEnv)) {
			return this.getEndpointsListFromRemoteVM(datasource, org);
		}
		try {
			response = this.listEndpoints(payload);
			String str = response.getResponse();
			JSONObject resJSON = new JSONObject(str);
			List<ICIPMLFederatedEndpoint> resultList = new ArrayList<>();
			String strArray = resJSON.getJSONArray("Endpoints").toString();
			JSONArray resArray = new JSONArray(strArray);
			// String nextToken = resJSON.getString("NextToken");
			// String datasource = requestJSON.getString("datasource");
			// String datasourceAlias = requestJSON.getString("datasourceAlias");
			// String org = requestJSON.getString("org");
			for (int i = 0; i < resArray.length(); i++) {
				JSONObject jsonObj = resArray.getJSONObject(i);
				ICIPMLFederatedEndpoint dto = parseFedEndpoint(jsonObj, datasource, datasourceAlias, org);
				resultList.add(dto);

			}

			return resultList;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.error(e.getMessage());
			return null;

		}

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
		dto.setSourceName(jsonObject.optString("name"));
		dto.setName(jsonObject.optString("name"));
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH-mm-ss");
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
		fedendpointid.setSourceId(jsonObject.optString("name"));
		dto.setSourceEndpointId(fedendpointid);
		dto.setIsDeleted(false);
		dto.setSourceOrg(jsonObject.optString("sourceOrg"));
		Date date1 = new Date();
		Timestamp ts1 = new Timestamp(date1.getTime());
		dto.setSyncDate(ts1);
		if (dto.getCreatedOn() == null)
			dto.setCreatedOn(ts1);
		dto.setRawPayload(jsonObject.toString());
		dto.setType("AWSSAGEMAKER");
		return dto;
	}

	@Override
	public ICIPPolyAIResponseWrapper createModelDeployment(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper deleteModel(ICIPPolyAIRequestWrapper request)
			throws LeapException, JSONException, IOException {
		ICIPPolyAIResponseWrapper modelObj = new ICIPPolyAIResponseWrapper();
		JSONObject reqJsonObj = new JSONObject(request.getRequest());
		ICIPMLFederatedModel dto = new ICIPMLFederatedModel();
		FedModelsID fedmodid = new FedModelsID();
		fedmodid.setSourceId(reqJsonObj.optString("modelId"));
		fedmodid.setOrganisation(request.getOrganization());
		Optional<ICIPMLFederatedModel> modObj = fedModelRepo.findById(Integer.parseInt(reqJsonObj.optString("modelId")));
		if (modObj.isPresent()) {
			dto = modObj.get();
			Map<String, String> responseFromVM = deleteModelFromRemoteVM(fedmodid.getAdapterId(),
					fedmodid.getOrganisation(), fedmodid.getSourceId());
			if (ICIPPluginConstants.MESSAGE_SUCCESS.equalsIgnoreCase(responseFromVM.get(ICIPPluginConstants.MESSAGE))) {
				fedModelRepo.delete(dto);
				modelObj.setResponse(responseFromVM.get(ICIPPluginConstants.RESPONSE));
				modelObj.setType(ICIPPluginConstants.VM_SUCCESS);
				return modelObj;
			} else {
				modelObj.setResponse(responseFromVM.get(ICIPPluginConstants.RESPONSE));
				modelObj.setType(ICIPPluginConstants.VM_FAILED);
				return modelObj;
			}

		}
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
	
}
