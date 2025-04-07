package com.infosys.icets.icip.icipmodelserver.v2.service.util;

import java.io.IOException;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.service.IICIPDatasourceService;
import com.infosys.icets.icip.icipmodelserver.v2.model.dto.ICIPPolyAIRequestWrapper;
import com.infosys.icets.icip.icipmodelserver.v2.model.dto.ICIPPolyAIResponseWrapper;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ResponseWrapper;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPMLFederatedEndpointDTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPMLFederatedModelDTO;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLFederatedEndpointRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPMLFederatedEndpointService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPMLFederatedModelService;
import com.infosys.icets.icip.icipwebeditor.model.FedEndpointID;
import com.infosys.icets.icip.icipwebeditor.model.FedModelsID;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPMLFederatedEndpointDTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPMLFederatedModelDTO;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.AICRegBodyV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.Container;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.EnvironmentVariablesV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.PortsV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.LabelsV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.Artifacts;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.AICEndpointBodyV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.DeploymentBodyV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.InferenceConfigV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.InferenceSpecV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ServingSpecV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.TritonSpecV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ResourceConfig;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ModelUrisV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ModelUrisSuperV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.Computes;

@Component("aicloudmodelservice")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPModelServiceAICloud implements IICIPModelServiceUtil {
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPModelServiceAICloud.class);

	private static final String MODEL_ID = "modelId";
	
	private static final String VERSION = "version";

	private static final String VERSION_V = "Version";
	
	private static final String APPLICATION_JSON = "application/json";

	private static final String ACCEPT = "accept";
	
	private static final String USER_ID = "userId";
	
	private static final String DETAILS = "details";

	private static final String DETAIL = "detail";
	
	private static final String MESSAGE = "message";
	
	private static final String CODE = "code";
	
	private static final String BODY = "body";
	
	private static final String FAILED = "Failed";

	private static final String INTERNAL_SERVER_ERROR = "INTERNAL SERVER ERROR";
	
	private static final String SSL_CONTEXT_ERROR = "Failed to create SSLContext";

	private static final String AICLOUD = "AICLOUD";
	
	private static final String ATTRIBUTES = "attributes";
	
	private static final String EXCEPTION = "Exception";

	private static final String OBJECT = "object";
	
	private static final String PATTERN = "pattern";
	
	private static final String MODEL_NAME = "Model Name";
	
	private static final String STRING = "string";

	private static final String DESCRIPTION = "Description";
	
	private static final String CONTAINER_IMAGEURI = "Container ImageUri";

	private static final String HEALTH_PROBEURI = "Health ProbeUri";

	private static final String STORAGE_TYPE = "Storage Type";

	private static final String STORAGE_URI = "Storage Uri";

	private static final String ARRAY = "array";

	@LeapProperty("icip.certificateCheck")
	private String certificateCheck;

	@Autowired
	private IICIPDatasourceService dsService;
	@Autowired
	private ICIPMLFederatedModelService fedModelService;
	@Autowired
	private ICIPMLFederatedEndpointService fedEndpointService;

	@Autowired
	private ICIPMLFederatedEndpointRepository fedEndpointRepo;
	@Autowired
	private ICIPMLFederatedModelsRepository fedModelRepo;

	public void updateModelAndEndpoint(ICIPMLFederatedModelDTO modelDTO, ICIPMLFederatedEndpointDTO endpointDTO) {

		fedModelService.updateModel(modelDTO);
		fedEndpointService.updateEndpoint(endpointDTO);
	}
	@Override
	public ICIPPolyAIResponseWrapper getRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);

		if(sslContext != null) {
			ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
			
			JSONObject requestJSON = new JSONObject(request.getBody());
			String modelId = requestJSON.getString(MODEL_ID);
			String version = requestJSON.getString(VERSION);
			
			String url = connDetails.optString("Url") + "/api/v1/models/" + modelId + "/versions/"+version;
	
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
	
			OkHttpClient client = newBuilder.build();
			Request requestokHttp = new Request.Builder().url(url).addHeader(ACCEPT, APPLICATION_JSON)
					.addHeader(USER_ID, connDetails.optString(USER_ID)).build();
			Response response = client.newCall(requestokHttp).execute();
			String responseString = response.body().string();
			logger.info("response received - getRegisteredModel : "+responseString);
			try {
				JSONObject respobj = new JSONObject(responseString);
				JSONObject dataobj = respobj.getJSONObject("data");
				JSONObject model = dataobj.getJSONObject("model");
				ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
				wrapResponse.setResponse(model.toString());
				return wrapResponse;
			}catch(Exception e) {
				String msg="";
				if(response.code() == 422) {
					JSONObject respobj = new JSONObject(responseString);
					JSONArray statusArr=respobj.getJSONArray(DETAILS);
					JSONObject statusobj=statusArr.getJSONObject(0);
					msg=statusobj.getString(MESSAGE);
				}
				else if(response.code() == 400  || response.code() == 404 || response.code() == 403 || response.code() == 429) {
					JSONObject respobj = new JSONObject(responseString);
					JSONObject detailObj = respobj.getJSONObject(DETAIL);
					msg = detailObj.getString(MESSAGE);
				}
				else if(response.code() == 500) {
					msg=INTERNAL_SERVER_ERROR;
				}else {
					logger.error(responseString);
					msg = responseString;
				}
				throw new IOException(msg);
			}
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}

	@Override
	public JSONObject getJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", AICLOUD);
			JSONObject attributes = new JSONObject();
			ds.put(ATTRIBUTES, attributes);
			JSONObject position = new JSONObject();
			ds.put("position", position);
		} catch (JSONException e) {
			logger.error(EXCEPTION, e.getMessage());
		}
		return ds;
	}

	@Override
	public JSONObject getRegisterModelJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", AICLOUD);
			JSONObject attributes = new JSONObject();
			attributes.put("type", OBJECT);
			JSONObject properties = new JSONObject();
            properties.put(MODEL_NAME, new JSONObject().put("type", STRING).put(PATTERN, "^[a-z0-9-]{0,15}$"));
            properties.put(VERSION_V, new JSONObject().put("type", STRING).put(PATTERN, "^(0|[1-9]\\d*)(\\.\\d+)?$"));
            properties.put(DESCRIPTION, new JSONObject().put("type", STRING).put(PATTERN, "[a-z]"));
            properties.put(CONTAINER_IMAGEURI, new JSONObject().put("type", STRING));
            properties.put(HEALTH_PROBEURI, new JSONObject().put("type", STRING));
            properties.put(STORAGE_TYPE, new JSONObject().put("type", STRING));
            properties.put(STORAGE_URI, new JSONObject().put("type", STRING));
//            env_items as pair in json form
            JSONObject env = new JSONObject().put("type", ARRAY);
            JSONObject env_items = new JSONObject().put("type", OBJECT);
            JSONObject env_properties = new JSONObject();
            env_properties.put("EnvVariable Name", new JSONObject().put("type", STRING).put("minLength", 3));
            env_properties.put("EnvVariable Value", new JSONObject().put("type", STRING).put("minLength", 3));
            env_items.put("properties",env_properties);
            env.put("items",env_items);
            properties.put("env",env );
//            port_items as pair in json form
            JSONObject port = new JSONObject().put("type", ARRAY);
            JSONObject port_items = new JSONObject().put("type", OBJECT);
            JSONObject port_properties = new JSONObject();
            port_properties.put("Port Name", new JSONObject().put("type", STRING).put("minLength", 3));
            port_properties.put("Port Value", new JSONObject().put("type", STRING).put("minLength", 4).put(PATTERN, "^(0|[1-9]\\d*)?$"));
            port_items.put("properties",port_properties);
            port.put("items",port_items);
            properties.put("port",port );
//            label_items as pair in json form
            JSONObject label = new JSONObject().put("type", ARRAY);
            JSONObject label_items = new JSONObject().put("type", OBJECT);
            JSONObject label_properties = new JSONObject();
            label_properties.put("Label Name", new JSONObject().put("type", STRING).put("minLength", 3));
            label_properties.put("Label Value", new JSONObject().put("type", STRING).put("minLength", 3));
            label_items.put("properties",label_properties);
            label.put("items",label_items);
            properties.put("label",label );
            attributes.put("properties", properties);
            List<String> req=new ArrayList<>();
            req.add(MODEL_NAME);
            req.add(VERSION_V);
            req.add("env");
            req.add("port");
            req.add("label");
            req.add(CONTAINER_IMAGEURI);
            req.add(STORAGE_TYPE);
            req.add(STORAGE_URI);
            attributes.put("required", req);
            JSONObject uischema = new JSONObject();
            uischema.put("type", "VerticalLayout");
            JSONArray elements = new JSONArray();
            elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Model Name"));
            elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Version"));
            elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Description"));
            JSONArray horizontalElements1 = new JSONArray();
            horizontalElements1.put(new JSONObject().put("type", "Control").put("scope", "#/properties/env"));
            elements.put(new JSONObject().put("type", "HorizontalLayout").put("elements", horizontalElements1));
            JSONArray horizontalElements2 = new JSONArray();
            horizontalElements2.put(new JSONObject().put("type", "Control").put("scope", "#/properties/port"));
            elements.put(new JSONObject().put("type", "HorizontalLayout").put("elements", horizontalElements2));
            JSONArray horizontalElements3 = new JSONArray();
            horizontalElements3.put(new JSONObject().put("type", "Control").put("scope", "#/properties/label"));
            elements.put(new JSONObject().put("type", "HorizontalLayout").put("elements", horizontalElements3));
            elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Health ProbeUri"));
            elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Container ImageUri"));
            elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Storage Type"));
            elements.put(new JSONObject().put("type", "Control").put("scope", "#/properties/Storage Uri"));
            uischema.put("elements", elements);
            ds.put(ATTRIBUTES, attributes);
            ds.put("uischema", uischema);
        	} catch (JSONException e) {
			logger.error(EXCEPTION, e);
		}
		return ds;
	}

	@Override
	public JSONObject getEndpointJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", AICLOUD);
			JSONObject attributes = new JSONObject();
			attributes.put("Endpoint Name", "");
			attributes.put("Context Uri", "");
			ds.put(ATTRIBUTES, attributes);
		} catch (JSONException e) {
			logger.error(EXCEPTION, e);
		}
		return ds;
	}

	@Override
	public JSONObject getDeployModelJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", AICLOUD);
			JSONObject attributes = new JSONObject();
			attributes.put("Endpoint Id", "");
			attributes.put("Model Id", "");
			attributes.put(VERSION_V, "");
			attributes.put("Serving Framework", "");
			attributes.put("Min Replica Count", "");
			attributes.put("Max Replica Count", "");
			attributes.put("Computes Type", "");
			attributes.put("Computes MaxQty", "");
			attributes.put("Computes MinQty", "");
			attributes.put("Computes Memory", "");
			attributes.put("Volume Size", "");
			attributes.put("Prefix Uri", "");
			attributes.put("Predict Uri", "");
			ds.put(ATTRIBUTES, attributes);
		} catch (JSONException e) {
			logger.error(EXCEPTION, e);
		}
		return ds;
	}

	@Override
	public ICIPPolyAIResponseWrapper deployModel(ICIPPolyAIRequestWrapper request) throws IOException,LeapException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);

		if(sslContext != null) {
			ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
			String strbody = request.getBody();
			JSONObject body = new JSONObject(strbody);
	
			DeploymentBodyV1 deploybody = new DeploymentBodyV1();
			InferenceConfigV1 infconfig = new InferenceConfigV1();
			InferenceSpecV1 infspec = new InferenceSpecV1();
			ResourceConfig resconfig = new ResourceConfig();
			ModelUrisSuperV1 modspec = new ModelUrisSuperV1();
			ModelUrisV1 moduris = new ModelUrisV1();
			Computes computes = new Computes();
	
			moduris.setPrefixUri(body.getString("Prefix Uri"));
			moduris.setPredictUri(body.getString("Predict Uri"));
			JSONObject modurisJSON = new JSONObject(moduris);
			modspec.setModelUris(modurisJSON);
			JSONObject modspecjson = new JSONObject(modspec);
			JSONArray modspecarr = new JSONArray();
			modspecarr.put(modspecjson);
			
			computes.setMaxQty(body.getInt("Computes MaxQty"));
			computes.setMinQty(body.getInt("Computes MinQty"));
			computes.setMemory(body.getString("Computes Memory"));
			computes.setType(body.getString("Computes Type"));
			JSONObject computesobj = new JSONObject(computes);
			JSONArray computesarr = new JSONArray();
			computesarr.put(computesobj);
			resconfig.setComputes(computesarr);
			resconfig.setVolumeSizeinGB(body.getInt("Volume Size"));
			infspec.setMaxReplicaCount(body.getInt("Max Replica Count"));
			infspec.setMinReplicaCount(body.getInt("Min Replica Count"));
			infspec.setModelSpec(modspecarr);
			infspec.setContainerResourceConfig(resconfig);
			infconfig.setServingFramework(body.getString("Serving Framework"));
			infconfig.setInferenceSpec(infspec);
	
			deploybody.setEndpointId(body.getString("Endpoint Id"));
			deploybody.setModelId(body.getString("Model Id"));
			deploybody.setVersion(body.getInt(VERSION_V));
			deploybody.setInferenceConfig(infconfig);
			JSONObject deployobj = new JSONObject(deploybody);
			logger.info("DeployModel - final payload: "+deployobj);
	
			String url = connDetails.optString("Url") + "/api/v1/endpoint/deploy";
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
	
			OkHttpClient client = newBuilder.build();
			MediaType mediaType = MediaType.parse(APPLICATION_JSON);
			RequestBody regBody = RequestBody.create(mediaType, deployobj.toString());
			Request requestokHttp = new Request.Builder().url(url).method("POST", regBody)
					.addHeader(ACCEPT, APPLICATION_JSON).addHeader(USER_ID, connDetails.optString(USER_ID)).build();
			Response response = client.newCall(requestokHttp).execute();
			String responseString = response.body().string();
			logger.info("DeployModel - response received : "+responseString);
			try {
				JSONObject respobj = new JSONObject(responseString);
				JSONObject dataobj = respobj.getJSONObject("data");
				String appStatus = dataobj.getString("status");
				if (dataobj.getString("status").equals("InProgress")) {
					String modId = dataobj.getString(MODEL_ID);
					String endpointId = dataobj.getString("endpointId");
					// endpoint
					ICIPMLFederatedEndpointDTO endpointDto = new ICIPMLFederatedEndpointDTO();
					endpointDto.setAdapterId(request.getName());
					endpointDto.setSourceId(endpointId);
					endpointDto.setOrganisation(request.getOrganization());
					endpointDto.setSourceModifiedBy("");
					endpointDto.setStatus("InProgress");
					// model
					ICIPMLFederatedModelDTO modelDto = new ICIPMLFederatedModelDTO();
					modelDto.setAdapterId(request.getName());
					modelDto.setSourceId(modId);
					modelDto.setOrganisation(request.getOrganization());
					modelDto.setSourceModifiedBy("");
					modelDto.setStatus(dataobj.getString("status"));
					modelDto.setDeployment(dataobj.getString("id"));
					this.updateModelAndEndpoint(modelDto, endpointDto);
				}
			}catch(Exception e) {
				String msg="";
				if(response.code() == 422) {
					JSONObject respobj = new JSONObject(responseString);
					JSONArray statusArr=respobj.getJSONArray(DETAILS);
					JSONObject statusobj=statusArr.getJSONObject(0);
					msg=statusobj.getString(MESSAGE);
				}
				else if(response.code() == 400  || response.code() == 404 || response.code() == 403) {
					JSONArray respArr = new JSONArray(responseString);
					JSONObject statusobj=respArr.getJSONObject(0);
					msg=statusobj.getString(MESSAGE);
				}
				else if(response.code() == 429) {
					JSONObject respobj = new JSONObject(responseString);
					JSONObject detailObj = respobj.getJSONObject(DETAIL);
					msg = detailObj.getString(MESSAGE);
				}
				else if(response.code() == 500) {
					msg=INTERNAL_SERVER_ERROR;
				}else {
					logger.error(responseString);
					msg = responseString;
				}
				throw new LeapException(msg);
			}
			ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
			wrapResponse.setResponse(responseString);
			wrapResponse.setType(datasource.getType());
			return wrapResponse;
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}

	@Override
	public ICIPMLFederatedModel registerModel(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		
		if(sslContext != null) {
			String strbody = request.getBody();
			JSONObject body = new JSONObject(strbody);
			ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
			String url = connDetails.optString("Url") + "/api/v1/models";
	
			AICRegBodyV1 aicbody = new AICRegBodyV1();
			Container container = new Container();
			Artifacts artifacts = new Artifacts();
	
			aicbody.setDescription(body.has(DESCRIPTION) ? body.getString(DESCRIPTION) : "");
			aicbody.setName(body.getString(MODEL_NAME));
			aicbody.setVersion(body.getInt(VERSION_V));
			aicbody.setProjectId(connDetails.optString("projectId"));
			artifacts.setStorageType(body.getString(STORAGE_TYPE));
			artifacts.setUri(body.getString(STORAGE_URI));
	
			container.setImageUri(body.getString(CONTAINER_IMAGEURI));
			if(body.has(HEALTH_PROBEURI)) {
				container.setHealthProbeUri(body.getString(HEALTH_PROBEURI));
			}
			if(body.has("port")) {
				JSONArray jsonarrport = new JSONArray();
				JSONArray portsArr=body.getJSONArray("port");
				if(portsArr.length()>=1) {
					for(int i=0;i<portsArr.length();i++) {
						JSONObject obj=portsArr.getJSONObject(i);
						PortsV1 ports = new PortsV1();
						ports.setName(obj.getString("Port Name"));
						ports.setValue(obj.getString("Port Value"));
						JSONObject portsobj = new JSONObject(ports);
						jsonarrport.put(portsobj);
					}
				}
				container.setPorts(jsonarrport);
			}
			
			if(body.has("env")) {
				JSONArray jsonarrenv = new JSONArray();
				JSONArray envArr=body.getJSONArray("env");
				for(int i=0;i<envArr.length();i++) {
					JSONObject obj=envArr.getJSONObject(i);
					EnvironmentVariablesV1 envVar = new EnvironmentVariablesV1();
					envVar.setName(obj.getString("EnvVariable Name"));
					envVar.setValue(obj.getString("EnvVariable Value"));
					JSONObject envsobj = new JSONObject(envVar);
					jsonarrenv.put(envsobj);
				}
				container.setEnvVariables(jsonarrenv);
			}
	
			if(body.has("label")) {
				JSONArray jsonarrlabel = new JSONArray();
				JSONArray labelArr=body.getJSONArray("label");
				for(int i=0;i<labelArr.length();i++) {
					JSONObject obj=labelArr.getJSONObject(i);
					LabelsV1 labels = new LabelsV1();
					labels.setName(obj.getString("Label Name"));
					labels.setValue(obj.getString("Label Value"));
					JSONObject labelsobj = new JSONObject(labels);
					jsonarrlabel.put(labelsobj);
				}
				container.setLabels(jsonarrlabel);
			}
			
			aicbody.setArtifacts(artifacts);
			aicbody.setContainer(container);
			JSONObject aicb = new JSONObject(aicbody);
			logger.info("RegisterModel - final payload: "+aicb);
			
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
			OkHttpClient client = newBuilder.build();
			MediaType mediaType = MediaType.parse(APPLICATION_JSON);
			RequestBody regbody = RequestBody.create(mediaType, aicb.toString());
			Request requestokHttp = new Request.Builder().url(url).method("POST", regbody)
					.addHeader(ACCEPT, APPLICATION_JSON).addHeader(USER_ID, connDetails.optString(USER_ID)).build();
			Response response = client.newCall(requestokHttp).execute();
			String responseString = response.body().string();
			logger.info("RegisterModel response received: "+responseString);
			try{
				JSONObject respobj = new JSONObject(responseString);
				JSONObject dataobj = respobj.getJSONObject("data");
				ICIPMLFederatedModel saveModel = null;
				try {
					saveModel = parseMLFedModel(dataobj, datasource.getName(), datasource.getAlias(),
							datasource.getOrganization());
				} catch (ParseException e) {
					logger.info(responseString);
				}
				return saveModel;
			}catch(Exception e) {
				String msg="";
				if(response.code() == 422) {
					JSONObject respobj = new JSONObject(responseString);
					JSONArray statusArr=respobj.getJSONArray(DETAILS);
					JSONObject statusobj=statusArr.getJSONObject(0);
					String msgString=statusobj.getString(MESSAGE);
					if(msgString.equalsIgnoreCase("name field accepts only alphabets,hyphen and numbers")){
						msgString = "Name field accepts only Lowercase alphabets,Hyphen and Numbers";
					}
					msg = msgString;
				}
				else if(response.code() == 400  || response.code() == 404) {
					JSONArray respArr = new JSONArray(responseString);
					JSONObject statusobj=respArr.getJSONObject(0);
					msg=statusobj.getString(MESSAGE);
				}
				else if(response.code() == 500) {
					msg=INTERNAL_SERVER_ERROR;
				}else {
					logger.error(responseString);
					msg = responseString;
				}
				throw new LeapException(msg);
			}
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}

	@Override
	public ICIPPolyAIResponseWrapper listRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		
		if(sslContext != null) {
			JSONObject requestJSON = new JSONObject(request.getRequest());
			ICIPDatasource datasource = dsService.getDatasource(requestJSON.getString("datasource"),
					requestJSON.getString("org"));
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
			String url = connDetails.optString("Url") + "/api/v1/models?projectId=" + connDetails.optString("projectId");
	
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
	
			OkHttpClient client = newBuilder.build();
			Request requestokHttp = new Request.Builder().url(url).addHeader(ACCEPT, APPLICATION_JSON)
					.addHeader(USER_ID, connDetails.optString(USER_ID)).build();
			Response response = client.newCall(requestokHttp).execute();
			String responseString = response.body().string();
			ObjectMapper objectMapper = new ObjectMapper();
			ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
			if (response.code() == 200) {
				ResponseWrapper rwrapper = objectMapper.readValue(responseString, ResponseWrapper.class);
				wrapResponse.setResponse(objectMapper.writeValueAsString(rwrapper.getData().getModels()));
			} else {
				wrapResponse.setResponse(responseString);
			}
			wrapResponse.setType(datasource.getType());
			return wrapResponse;
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}

	@Override
	public ICIPPolyAIResponseWrapper getModelEndpointDetails(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);

		if(sslContext != null) {
			JSONObject requestJSON = new JSONObject(request.getRequest());
			String datasourceName = requestJSON.getString("datasource");
			String org = requestJSON.getString("org");
			ICIPDatasource datasource = dsService.getDatasource(datasourceName, org);
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
	
			// Build the url
			String url = connDetails.getString("baseUrl") + "/" + connDetails.getString(VERSION) + "/models";
			// Build the path
			url = url + "/" + new JSONObject(request.getRequest()).getString("deploymentId");
	
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
	
			OkHttpClient client = newBuilder.build();
			Request requestokHttp = new Request.Builder().url(url).addHeader(ACCEPT, APPLICATION_JSON)
					.addHeader(USER_ID, connDetails.getString("userID")).build();
			Response response = client.newCall(requestokHttp).execute();
			String responseString = response.body().string();
			ObjectMapper objectMapper = new ObjectMapper();
			ResponseWrapper rwrapper = objectMapper.readValue(responseString, ResponseWrapper.class);
			ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
			wrapResponse.setResponse(objectMapper.writeValueAsString(rwrapper.getData().getModels()));
			wrapResponse.setType(request.getType());
			return wrapResponse;
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}

	@Override
	public ICIPPolyAIResponseWrapper deleteDeployment(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);

		if(sslContext != null) {
			ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
			
			JSONObject requestJSON = new JSONObject(request.getBody());
			String deploymentId;
			if(requestJSON.has("deploymentId")) {
				deploymentId = requestJSON.getString("deploymentId");
			}else {
				String modelId = requestJSON.getString(MODEL_ID);
				String version = requestJSON.getString(VERSION);
				ICIPPolyAIRequestWrapper req = new ICIPPolyAIRequestWrapper();
				request.setOrganization(request.getOrganization());
				request.setName(request.getName());
				JSONObject body = new JSONObject();
				body.put(MODEL_ID, modelId);
				body.put(VERSION, version);
				request.setBody(body.toString());
				logger.info("Request for getRegisteredModel(to fetch endpointId associated with Deployment : "+request);
				ICIPPolyAIResponseWrapper result = this.getRegisteredModel(request);
				JSONObject model = new JSONObject(result.getResponse());
				String appStatus = model.getString("status");
				if(appStatus.equalsIgnoreCase("undeployed")) {
					String msg = "Model is UnDeployed already, Please run SyncModel to update the status";
					throw new LeapException(msg);
				}else {
					String endpointId = model.getString("endpointId");
					deploymentId = fedEndpointService.getDeploymentIdByModAndEndpoint(endpointId, request.getName(), request.getOrganization(),modelId);
					if(deploymentId == null) {
						throw new LeapException("Deployment details not found");
					}
				}
			}
			String url = connDetails.optString("Url") + "/api/v1/endpoint/deploy/" + deploymentId;
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
	
			OkHttpClient client = newBuilder.build();
			Request requestokHttp = new Request.Builder().url(url).delete()
					.addHeader(ACCEPT, APPLICATION_JSON).addHeader(USER_ID, connDetails.optString(USER_ID)).build();
			Response response = client.newCall(requestokHttp).execute();
			String responseString = response.body().string();
			logger.info("response received - delete deployment : "+responseString);
			try {
				JSONObject respobj = new JSONObject(responseString);
				JSONObject dataobj = respobj.getJSONObject("data");
				ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
				wrapResponse.setResponse(dataobj.toString());
				return wrapResponse;
			}catch(Exception e) {
				String msg="";
				if(response.code() == 400  || response.code() == 404) {
					JSONArray respArr = new JSONArray(responseString);
					JSONObject statusobj=respArr.getJSONObject(0);
					msg=statusobj.getString(MESSAGE);
				}else if(response.code() == 403) {
					JSONObject respobj = new JSONObject(responseString);
					JSONObject detailObj = respobj.getJSONObject(DETAIL);
					msg = detailObj.getString(MESSAGE);
				}else if(response.code() == 500) {
					msg=INTERNAL_SERVER_ERROR;
				}else {
					logger.error(responseString);
					msg = responseString;
				}
				throw new LeapException(msg);
			}
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}

	@Override
	public ICIPPolyAIResponseWrapper listEndpoints(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		
		if(sslContext != null) {
			JSONObject requestJSON = new JSONObject(request.getRequest());
			String datasourceName = requestJSON.getString("datasource");
			String org = requestJSON.getString("org");
			ICIPDatasource datasource = dsService.getDatasource(datasourceName, org);
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
			String url = connDetails.optString("Url") + "/api/v1/endpoint?projectId=" + connDetails.optString("projectId");
	
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
	
			OkHttpClient client = newBuilder.build();
			Request requestokHttp = new Request.Builder().url(url).addHeader(ACCEPT, APPLICATION_JSON)
					.addHeader(USER_ID, connDetails.optString(USER_ID)).build();
			Response response = client.newCall(requestokHttp).execute();
			String responseString = response.body().string();
			ObjectMapper objectMapper = new ObjectMapper();
			ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
	
			if (response.code() == 200) {
				ResponseWrapper rwrapper = objectMapper.readValue(responseString, ResponseWrapper.class);
				wrapResponse.setResponse(objectMapper.writeValueAsString(rwrapper.getData().getEndpoints()));
			} else {
				wrapResponse.setResponse(responseString);
			}
			wrapResponse.setType(datasource.getType());
			return wrapResponse;
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}

	@Override
	public ICIPMLFederatedEndpoint createEndpoint(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);

		if(sslContext != null) {
			ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
			String Url = connDetails.optString("Url") + "/api/v1/endpoint";
			String strbody = request.getBody();
			JSONObject body = new JSONObject(strbody);
			AICEndpointBodyV1 endpointobj = new AICEndpointBodyV1();
			endpointobj.setContextUri(body.getString("Context Uri"));
			endpointobj.setName(body.getString("Endpoint Name"));
			endpointobj.setProjectId(connDetails.optString("projectId"));
			JSONObject bodyJSON = new JSONObject(endpointobj);
			logger.info("Payload for CreateEndpoint: "+bodyJSON.toString());
			
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
			OkHttpClient client = newBuilder.build();
			MediaType mediaType = MediaType.parse(APPLICATION_JSON);
			RequestBody regBody = RequestBody.create(mediaType, bodyJSON.toString());
			Request requestokHttp = new Request.Builder().url(Url).method("POST", regBody)
					.addHeader(ACCEPT, APPLICATION_JSON).addHeader(USER_ID, connDetails.optString(USER_ID)).build();
			Response response = client.newCall(requestokHttp).execute();
			String responseString = response.body().string();
			logger.info("ResponseBody - EndpointCreation : "+responseString);
			try {
				JSONObject respobj = new JSONObject(responseString);
				JSONObject dataobj = respobj.getJSONObject("data");
				ICIPMLFederatedEndpoint saveEndpoint = null;
				try {
					saveEndpoint = parseFedEndpoint(dataobj, datasource.getName(), datasource.getAlias(),
							datasource.getOrganization());
	
				} catch (ParseException e) {
					throw new LeapException(e.getMessage());
				}
				return saveEndpoint;
			}catch(Exception e) {
				String msg="";
				if(response.code() == 422) {
					JSONObject respobj = new JSONObject(responseString);
					JSONArray statusArr=respobj.getJSONArray(DETAILS);
					JSONObject statusobj=statusArr.getJSONObject(0);
					msg=statusobj.getString(MESSAGE);
				}
				else if(response.code() == 400  || response.code() == 404) {
					JSONArray respArr = new JSONArray(responseString);
					JSONObject statusobj=respArr.getJSONObject(0);
					msg=statusobj.getString(MESSAGE);
				}
				else if(response.code() == 500) {
					msg=INTERNAL_SERVER_ERROR;
				}
				else {
					logger.error(responseString);
					msg = responseString;
				}
				throw new LeapException(msg);
			}
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}

	@Override
	public ICIPPolyAIResponseWrapper deleteEndpoint(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);

		if(sslContext != null) {
			ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
			String endpointId = request.getBody();
			String url = connDetails.optString("Url") + "/api/v1/endpoint/" + endpointId ;
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
	
			OkHttpClient client = newBuilder.build();
			Request requestokHttp = new Request.Builder().url(url).delete()
					.addHeader(ACCEPT, APPLICATION_JSON).addHeader(USER_ID, connDetails.optString(USER_ID)).build();
			Response response = client.newCall(requestokHttp).execute();
			String responseString = response.body().string();
			ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
			logger.info("DeleteEndpoint - received response: "+responseString);
			try {
				ICIPMLFederatedEndpointDTO endpointDto = new ICIPMLFederatedEndpointDTO();
				endpointDto.setAdapterId(request.getName());
				endpointDto.setSourceId(endpointId);
				endpointDto.setOrganisation(request.getOrganization());
				fedEndpointService.updateIsDelEndpoint(endpointDto);
				if(response.code() == 404 || response.code() == 500) {
					JSONObject msgObj = new JSONObject();
					msgObj.put("msg", "Endpoint is deleted");
					wrapResponse.setResponse(msgObj.toString());
					return wrapResponse;
				}
				JSONObject respobj = new JSONObject(responseString);
				JSONObject dataobj = respobj.getJSONObject("data");
				wrapResponse.setResponse(dataobj.toString());
				return wrapResponse;
			}catch(Exception e) {
				String msg="";
				if(response.code() == 404 || response.code() == 403) {
					JSONObject respobj = new JSONObject(responseString);
					JSONObject detailobj = respobj.getJSONObject(DETAIL);
					msg=detailobj.getString(MESSAGE);
				}
				else if(response.code() == 500) {
					msg=INTERNAL_SERVER_ERROR;
				}else {
					logger.error(responseString);
					msg = responseString;
				}
				throw new LeapException(msg);
			}
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}

	@Override
	public ICIPPolyAIResponseWrapper getEndpoint(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);

		if(sslContext != null) {
			ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
			String url = connDetails.optString("Url") + "/api/v1/endpoint/" + connDetails.optString("endId");
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
	
			OkHttpClient client = newBuilder.build();
			Request requestokHttp = new Request.Builder().url(url).addHeader(ACCEPT, APPLICATION_JSON)
					.addHeader(USER_ID, connDetails.optString(USER_ID)).build();
			Response response = client.newCall(requestokHttp).execute();
			String responseString = response.body().string();
			ObjectMapper objectMapper = new ObjectMapper();
			ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
			wrapResponse.setResponse(responseString);
			wrapResponse.setType(datasource.getType());
			return wrapResponse;
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}

	@Override
	public ICIPPolyAIResponseWrapper getDeploymentStatus(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);

		if(sslContext != null) {
			ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
			String body =request.getBody();
			String url = connDetails.optString("Url") + "/api/v1/endpoint/deploy/" + body;
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
	
			OkHttpClient client = newBuilder.build();
			Request requestokHttp = new Request.Builder().url(url).addHeader(ACCEPT, APPLICATION_JSON)
					.addHeader("Connection", "Keep-alive").addHeader("Accept-Encoding", "gzip, deflate, br")
					.addHeader("Accept", "*/*").addHeader("User-Agent", "PostmanRuntime/7.29.0")
					.addHeader(USER_ID, connDetails.optString(USER_ID)).build();
			Response response = client.newCall(requestokHttp).execute();
			ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
			JSONObject sendBody = new JSONObject();
			if(response.code() == 200) {
				String responseString = response.body().string();
				JSONObject respobj = new JSONObject(responseString);
				JSONObject dataobj = respobj.getJSONObject("data");
				sendBody.put(CODE,"200");
				sendBody.put(BODY, dataobj.toString());
				wrapResponse.setResponse(sendBody.toString());
				return wrapResponse;
			}
			else if(response.code() == 400) {
				String responseString = response.body().string();
				try {
					JSONObject respobj = new JSONObject(responseString);
					JSONObject detailobj = respobj.getJSONObject(DETAIL);
					sendBody.put(CODE,"400");
					sendBody.put(BODY,detailobj.getString(MESSAGE));
					wrapResponse.setResponse(sendBody.toString());
				}catch(Exception e) {
					JSONArray respArr = new JSONArray(responseString);
					JSONObject statusobj=respArr.getJSONObject(0);
					sendBody.put(CODE,"400");
					sendBody.put(BODY,statusobj.getString(MESSAGE));
					wrapResponse.setResponse(sendBody.toString());
				}
				return wrapResponse;
			}else if(response.code() == 403) {
				String responseString = response.body().string();
				JSONArray respArr = new JSONArray(responseString);
				JSONObject statusobj=respArr.getJSONObject(0);
				String msg=statusobj.getString(MESSAGE);
				sendBody.put(CODE,"403");
				sendBody.put(BODY,msg);
				wrapResponse.setResponse(sendBody.toString());
				return wrapResponse;
			}else {
				sendBody.put(CODE,"500");
				sendBody.put(BODY,"error");
				wrapResponse.setResponse(sendBody.toString());
				return wrapResponse;
			}
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}

	private SSLContext getSslContext(TrustManager[] trustAllCerts) {
		SSLContext sslContext = null;
		try {
			sslContext = SSLContext.getInstance("TLSv1.2");

			sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
		} catch (KeyManagementException | NoSuchAlgorithmException e) {
			logger.error(EXCEPTION, e.getMessage());
		}
		return sslContext;
	}
	
	private TrustManager[] getTrustAllCerts() throws Exception {
		logger.info("certificateCheck value: {}", certificateCheck);
		if("true".equalsIgnoreCase(certificateCheck)) {
			// Load the default trust store
		    TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
		    trustManagerFactory.init((KeyStore) null);
	
		    // Get the trust managers from the factory
		    TrustManager[] trustManagers = trustManagerFactory.getTrustManagers();
	
		    // Ensure we have at least one X509TrustManager
		    for (TrustManager trustManager : trustManagers) {
		        if (trustManager instanceof X509TrustManager) {
		            return new TrustManager[] { (X509TrustManager) trustManager };
		        }
		    }
	
		    throw new IllegalStateException("No X509TrustManager found. Please install the certificate in keystore");
		}else {
			TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
				@Override
                public void checkClientTrusted(X509Certificate[] chain, String authType) {
                    // Log the certificate chain and authType
                    logger.info("checkClientTrusted called with authType: {}", authType);
                    for (X509Certificate cert : chain) {
                        logger.info("Client certificate: {}", cert.getSubjectDN());
                    }
                }

                @Override
                public void checkServerTrusted(X509Certificate[] chain, String authType) {
                    // Log the certificate chain and authType
                    logger.info("checkServerTrusted called with authType: {}", authType);
                    for (X509Certificate cert : chain) {
                        logger.info("Server certificate: {}", cert.getSubjectDN());
                    }
                }
	
				@Override
				public java.security.cert.X509Certificate[] getAcceptedIssuers() {
					return new java.security.cert.X509Certificate[] {};
				}
			} };
			return trustAllCerts;
		}   
	}

	@Override
	public List<ICIPMLFederatedModel> getSyncModelList(ICIPPolyAIRequestWrapper request) throws LeapException
			{
		JSONObject requestJSON = new JSONObject(request.getRequest());
		ICIPDatasource datasource = dsService.getDatasource(requestJSON.getString("datasource"),
				requestJSON.getString("org"));
        try {
	
		ICIPPolyAIResponseWrapper response = this.listRegisteredModel(request);
		String str = response.getResponse();
		List<ICIPMLFederatedModel> resultList = new ArrayList<>();
		JSONArray jsonArray = new JSONArray(str);
		String org = requestJSON.getString("org");
		String dsource = requestJSON.getString("datasource");
		String dsrcAlias = requestJSON.getString("datasourceAlias");
		for (int i = 0; i < jsonArray.length(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			ICIPMLFederatedModel dto = parseMLFedModel(jsonObject, dsource, dsrcAlias, org);
			resultList.add(dto);

		}
		return resultList;}
        catch ( Exception e) {
			throw new LeapException("AICLOUD Model Adapter:"+datasource.getName()+" Error In Syncing model mesage: "+e.getLocalizedMessage());

		}
	}

	private ICIPMLFederatedModel parseMLFedModel(JSONObject jsonObject, String dsource, String dsrcAlias, String org)
			throws ParseException, LeapException, Exception {
		ICIPMLFederatedModel dto = new ICIPMLFederatedModel();
		FedModelsID fedmodid = new FedModelsID();
		fedmodid.setAdapterId(dsource);
		fedmodid.setSourceId(jsonObject.getString("id"));
		fedmodid.setOrganisation(org);
		dto.setSourceModelId(fedmodid);
		Optional<ICIPMLFederatedModel> modObj = fedModelRepo.findById(fedmodid);
		Object description = jsonObject.get("description");
		if (modObj.isPresent()) {
			dto = modObj.get();	
		}
		else {
			dto.setLikes(0);
			dto.setName(jsonObject.getString("name"));
			dto.setDescription(description != null ? description.toString() : "");
		}
		Object modifiedOn = jsonObject.get("modifiedOn");
		if (modifiedOn instanceof String) {
			String modifiedOnStr = jsonObject.getString("modifiedOn");
			DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
			Date date = formatter.parse(modifiedOnStr);
			Timestamp ts = new Timestamp(date.getTime());
			dto.setSourceModifiedDate(ts);
		}else {
			dto.setSourceModifiedDate(null);
		}
		Object value = jsonObject.get("artifacts");
		if (value instanceof String) {
			String strArti = jsonObject.getString("artifacts");
			dto.setArtifacts(strArti);
		} else if (value instanceof JSONObject) {
			JSONObject artifacts = jsonObject.getJSONObject("artifacts");
			dto.setArtifacts(artifacts.toString());
		}
		JSONObject container = jsonObject.getJSONObject("container");
		dto.setContainer(container.toString());
		dto.setCreatedBy(jsonObject.getString("createdBy"));
		String createdon = jsonObject.getString("createdOn");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
		try {
			Date finishedTime = sdf.parse(jsonObject.getString("createdOn"));
			Timestamp ts2 = new Timestamp(finishedTime.getTime());
			dto.setCreatedOn(ts2);
		} catch (ParseException e) {
			logger.error(EXCEPTION, e);
		}
		
		dto.setSourceDescription(description != null ? description.toString() : "");
		
		Object updatedBy = jsonObject.get("updatedBy");
		dto.setSourceModifiedBy(updatedBy != null ? updatedBy.toString() : "");
		dto.setSourceName(jsonObject.getString("name"));
		dto.setSourceOrg(jsonObject.getString("projectId"));
		if(dto.getIsDeleted() != null && dto.getIsDeleted() == true) {
			dto.setIsDeleted(dto.getIsDeleted());
		}else {
			dto.setIsDeleted(jsonObject.getBoolean("isDeleted"));
		}
		dto.setRawPayload(jsonObject.toString());
		dto.setSourceStatus(jsonObject.getString("status"));
		Date date1 = new Date();
		Timestamp ts1 = new Timestamp(date1.getTime());
		dto.setSyncDate(ts1);
		Integer version = jsonObject.getInt(VERSION);
		dto.setVersion(Integer.toString(version));
		dto.setType(AICLOUD);
		dto.setAdapter(dsrcAlias);
		if ((dto.getStatus() != null && dto.getStatus().equalsIgnoreCase("inprogress")&&
				dto.getSourceStatus()!=null && dto.getSourceStatus().equalsIgnoreCase("Registered")) || ((dto.getStatus() != null && dto.getStatus().equalsIgnoreCase("inprogress")&&
				dto.getSourceStatus()!=null && dto.getSourceStatus().equalsIgnoreCase("undeployed")))) {
			if((dto.getDeployment() == null) || (dto.getDeployment().isEmpty())) {
				dto.setStatus(dto.getSourceStatus());
			}else if(dto.getDeployment() != null) {
				try {
					String deployId = dto.getDeployment();
					ICIPPolyAIRequestWrapper req = new ICIPPolyAIRequestWrapper();
					req.setName(dsource);
					req.setOrganization(org);
					req.setBody(deployId);
					ICIPPolyAIResponseWrapper result = this.getDeploymentStatus(req);
					String resp = result.getResponse();
					JSONObject respObj = new JSONObject(resp);
					String code = respObj.getString(CODE);
					if(code.equalsIgnoreCase("200")) {
						JSONObject bodyObj = new JSONObject(respObj.getString(BODY));
						JSONObject depObj = bodyObj.getJSONObject("deployment");
						dto.setStatus(depObj.getString("status"));
					}else if(code.equalsIgnoreCase("400")){
						String msg = respObj.getString(BODY);
						if(msg.equalsIgnoreCase("Deployment details not found")) {
							dto.setStatus(dto.getSourceStatus());
						}else {
							dto.setStatus(FAILED);
						}
					}else{
						dto.setStatus(dto.getSourceStatus());
					}
				} catch (IOException e) {
					logger.info(e.getMessage());
				}
			}
		} 
		else {
			if(dto.getStatus() != null && dto.getStatus().equalsIgnoreCase(FAILED)) {
				dto.setStatus(dto.getStatus());
			}else {
				dto.setStatus(dto.getSourceStatus());
			}
		}
		return dto;
	}

	@Override
	public List<ICIPMLFederatedEndpoint> getSyncEndpointList(ICIPPolyAIRequestWrapper payload) throws LeapException {
		JSONObject requestJSON = new JSONObject(payload.getRequest());
		ICIPDatasource datasource = dsService.getDatasource(requestJSON.getString("datasource"),
				requestJSON.getString("org"));
		ICIPPolyAIResponseWrapper response;
		try {
			response = this.listEndpoints(payload);
			String str = response.getResponse();
			List<ICIPMLFederatedEndpoint> resultList = new ArrayList<>();
			JSONArray jsonArray = new JSONArray(str);
			String org = requestJSON.getString("org");
			String dsource = requestJSON.getString("datasource");
			String dsrcAlias = requestJSON.getString("datasourceAlias");
			for (int i = 0; i < jsonArray.length(); i++) {
				JSONObject jsonObject = jsonArray.getJSONObject(i);
				ICIPMLFederatedEndpoint dto = parseFedEndpoint(jsonObject, dsource, dsrcAlias, org);
				resultList.add(dto);

			}

			return resultList;
		} catch (Exception e) {

			throw new LeapException("AICLOUD ENDPOINT ADAPTER:"+datasource.getName()+" ERROR IN SYNCING ENDPOINT mesage: "+e.getLocalizedMessage());

		}

	}

	private ICIPMLFederatedEndpoint parseFedEndpoint(JSONObject jsonObject, String dsource, String dsrcAlias,
			String org) throws ParseException {
		
		String modifiedOn = jsonObject.getString("modifiedOn");
		DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
		Date date = formatter.parse(modifiedOn);
		Timestamp ts = new Timestamp(date.getTime());
		String createdon = jsonObject.getString("createdOn");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
		Date finishedTime = sdf.parse(jsonObject.getString("createdOn"));
		Timestamp ts2 = new Timestamp(finishedTime.getTime());
		FedEndpointID fedendpointid = new FedEndpointID();
		fedendpointid.setAdapterId(dsource);
		fedendpointid.setSourceId(jsonObject.getString("id"));
		fedendpointid.setOrganisation(org);

		ICIPMLFederatedEndpoint dto = new ICIPMLFederatedEndpoint();
		Optional<ICIPMLFederatedEndpoint> modObj = fedEndpointRepo.findById(fedendpointid);
		if (modObj.isPresent())
			dto = modObj.get();
		else {
			dto.setLikes(0);
			dto.setName(jsonObject.getString("name"));
     		}

		dto.setCreatedBy(jsonObject.getString("createdBy"));
		dto.setCreatedOn(ts2);
		dto.setSourceEndpointId(fedendpointid);
		Object updatedBy = jsonObject.get("updatedBy");
		dto.setSourceModifiedBy(updatedBy != null ? updatedBy.toString() : "");
		dto.setSourceModifiedDate(ts);
		dto.setSourceName(jsonObject.getString("name"));
		dto.setSourceOrg(jsonObject.getString("projectId"));
		if(dto.getIsDeleted() != null && dto.getIsDeleted() == true) {
			dto.setIsDeleted(dto.getIsDeleted());
		}else {
			dto.setIsDeleted(jsonObject.getBoolean("isDeleted"));
		}
		dto.setRawPayload(jsonObject.toString());
		dto.setSourcestatus(jsonObject.getString("status"));
		Date date1 = new Date();
		Timestamp ts1 = new Timestamp(date1.getTime());
		dto.setSyncDate(ts);
		dto.setType(AICLOUD);
		dto.setAdapter(dsrcAlias);
		dto.setContextUri(jsonObject.getString("contextUri"));
		if (jsonObject.has("deployedModels") && jsonObject.get("deployedModels")!=null && !jsonObject.get("deployedModels").toString().equalsIgnoreCase("null")) {
			String deployedModObj = jsonObject.get("deployedModels").toString();
			JSONArray deployModels = new JSONArray(deployedModObj);
			if (deployModels.length() >= 1) {
				dto.setStatus("Mapped");
			} else {
				dto.setStatus("Created");
			}
			
			dto.setDeployedModels(deployModels.toString());
		} else {
			dto.setStatus("Created");
			dto.setDeployedModels("[]");
		}
		if(dto.getDescription() == null || dto.getDescription().isEmpty() ) {
			dto.setDescription("endpoint description");
		}
		return dto;
	}
	public Response executeUrl(String url,String userId) throws Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		if(sslContext != null) {
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
			OkHttpClient client = newBuilder.connectTimeout(50, TimeUnit.SECONDS).readTimeout(50, TimeUnit.SECONDS)
					.writeTimeout(50, TimeUnit.SECONDS).build();
			Request requestokHttp = new Request.Builder().url(url)
					.addHeader(ACCEPT, APPLICATION_JSON)
					.addHeader(USER_ID, userId).build();
			Response response = client.newCall(requestokHttp).execute();
			return response;
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}
	@Override
	public ICIPPolyAIResponseWrapper updateDeployment(ICIPPolyAIRequestWrapper request) throws IOException {
		// Method not required in this service class
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper createModelDeployment(ICIPPolyAIRequestWrapper request) throws IOException {
		// Method not required in this service class
		return null;
	}
	@Override
	public ICIPPolyAIResponseWrapper deleteModel(ICIPPolyAIRequestWrapper request) throws LeapException, JSONException, IOException, Exception {
		TrustManager[] trustAllCerts = getTrustAllCerts();
		SSLContext sslContext = getSslContext(trustAllCerts);
		
		if(sslContext != null) {
			String reqString = request.getRequest();
			JSONObject js = new JSONObject(reqString);
			String modelId = js.getString(MODEL_ID);
			String version = js.getString(VERSION);
			ICIPDatasource datasource = dsService.getDatasource(request.getName(), request.getOrganization());
			JSONObject connDetails = new JSONObject(datasource.getConnectionDetails());
			String url = connDetails.optString("Url") + "/api/v1/models/" + modelId + "/versions/" + version + "?projectId=" + connDetails.optString("projectId");
			OkHttpClient.Builder newBuilder = new OkHttpClient.Builder();
			newBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
			newBuilder.hostnameVerifier((hostname, session) -> true);
	
			OkHttpClient client = newBuilder.build();
			Request requestokHttp = new Request.Builder().url(url).delete()
					.addHeader(ACCEPT, APPLICATION_JSON).addHeader(USER_ID, connDetails.optString(USER_ID)).build();
			Response response = client.newCall(requestokHttp).execute();
			String responseString = response.body().string();
			logger.info("DeleteModel - received response: "+responseString);
			ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
			try {
				ICIPMLFederatedModelDTO modelDto = new ICIPMLFederatedModelDTO();
				modelDto.setAdapterId(request.getName());
				modelDto.setSourceId(modelId);
				modelDto.setOrganisation(request.getOrganization());
				fedModelService.updateIsDelModel(modelDto);
				JSONObject respobj = new JSONObject(responseString);
				if(response.code() == 404 ) {
					JSONObject msgObj = new JSONObject();
					msgObj.put("msg", "Model is deleted");
					wrapResponse.setResponse(msgObj.toString());
					return wrapResponse;
				}
				JSONObject dataobj = respobj.getJSONObject("data");
				wrapResponse.setResponse(dataobj.toString());
				return wrapResponse;
			}catch(Exception e) {
				String msg="";
				JSONObject respobj = new JSONObject(responseString);
				if(response.code() == 404 || response.code() == 403) {
					JSONObject detailobj = respobj.getJSONObject(DETAIL);
					msg=detailobj.getString(MESSAGE);
				}
				else if(response.code() == 500) {
					msg=INTERNAL_SERVER_ERROR;
				}else {
					logger.error(responseString);
					msg = responseString;
				}
				throw new LeapException(msg);
			}
		}else {
			throw new LeapException(SSL_CONTEXT_ERROR);
		}
	}
	
	
}
