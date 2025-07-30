package com.infosys.icets.icip.icipmodelserver.v2.service.util;

import java.io.IOException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipmodelserver.v2.model.dto.ICIPPolyAIRequestWrapper;
import com.infosys.icets.icip.icipmodelserver.v2.model.dto.ICIPPolyAIResponseWrapper;
import com.infosys.icets.icip.icipwebeditor.model.FedModelsID;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPMLFederatedEndpointDTO;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPMLFederatedEndpointService;
import com.infosys.icets.icip.icipwebeditor.model.FedEndpointID;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPMLFederatedEndpointRepository;

@Component("localmodelservice")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPModelServiceLocal implements IICIPModelServiceUtil {
	private static final Logger logger = LoggerFactory.getLogger(ICIPModelServiceLocal.class);
	@Autowired
	private ICIPMLFederatedModelsRepository fedModelRepo;
	@Autowired
	private ICIPMLFederatedEndpointRepository fedEndpointRepo;
	@Autowired
	private ICIPMLFederatedEndpointService fedEndpointService;
	
	private static final String LOCAL = "LOCAL";

	private static final String OBJECT = "object";

	private static final String MODEL_NAME = "Model Name";

	private static final String STRING = "string";

	private static final String PATTERN = "pattern";

	private static final String VERSION = "Version";

	private static final String DESCRIPTION = "Description";

	private static final String CONTAINER_IMAGEURI = "Container ImageUri";

	private static final String STORAGE_TYPE = "Storage Type";

	private static final String STORAGE_URI = "Storage Uri";

	private static final String ARRAY = "array";

	private static final String MIN_LENGTH = "minLength";

	private static final String PROPERTIES = "properties";

	private static final String ITEMS = "items";

	private static final String CONTROL = "Control";

	private static final String SCOPE = "scope";

	private static final String HORIZONTAL_LAYOUT = "HorizontalLayout"; 

	private static final String ELEMENTS = "elements";

	private static final String EXCEPTION = "Exception";

	private static final String LOCAL_SMALL = "Local";

	private static final String ENDPOINT_NAME = "Endpoint Name";

	private static final String SAMPLE = "Sample";

	private static final String APPLICATION = "Application";

	private static final String DEPLOYED_MODELS = "Deployed Models";

	private static final String REGISTERED  = "Registered";
	
	@Override
	public JSONObject getRegisterModelJson() {
		JSONObject ds = new JSONObject();
		try {
			ds.put("type", LOCAL);
			JSONObject attributes = new JSONObject();
			attributes.put("type", OBJECT);
			JSONObject properties = new JSONObject();
            properties.put(MODEL_NAME, new JSONObject().put("type", STRING).put(PATTERN, "^[a-z_-]+$"));
            properties.put(VERSION, new JSONObject().put("type", STRING).put(PATTERN, "^(0|[1-9]\\d*)(\\.\\d+)?$"));
            properties.put(DESCRIPTION, new JSONObject().put("type", STRING).put(PATTERN, "[a-z]"));
            properties.put(CONTAINER_IMAGEURI, new JSONObject().put("type", STRING));
            properties.put("Health ProbeUri", new JSONObject().put("type", STRING));
            properties.put(STORAGE_TYPE, new JSONObject().put("type", STRING));
            properties.put(STORAGE_URI, new JSONObject().put("type", STRING));
//            env_items as pair in json form
            JSONObject env = new JSONObject().put("type", ARRAY);
            JSONObject envItems = new JSONObject().put("type", OBJECT);
            JSONObject envProperties = new JSONObject();
            envProperties.put("EnvVariable Name", new JSONObject().put("type", STRING).put(MIN_LENGTH, 3));
            envProperties.put("EnvVariable Value", new JSONObject().put("type", STRING).put(MIN_LENGTH, 3));
            envItems.put(PROPERTIES,envProperties);
            env.put(ITEMS,envItems);
            properties.put("env",env );
//            port_items as pair in json form
            JSONObject port = new JSONObject().put("type", ARRAY);
            JSONObject portItems = new JSONObject().put("type", OBJECT);
            JSONObject portProperties = new JSONObject();
            portProperties.put("Port Name", new JSONObject().put("type", STRING).put(MIN_LENGTH, 3));
            portProperties.put("Port Value", new JSONObject().put("type", STRING).put(MIN_LENGTH, 4).put(PATTERN, "^(0|[1-9]\\d*)?$"));
            portItems.put(PROPERTIES,portProperties);
            port.put(ITEMS,portItems);
            properties.put("port",port );
//            label_items as pair in json form
            JSONObject label = new JSONObject().put("type", ARRAY);
            JSONObject labelItems = new JSONObject().put("type", OBJECT);
            JSONObject labelProperties = new JSONObject();
            labelProperties.put("Label Name", new JSONObject().put("type", STRING).put(MIN_LENGTH, 3));
            labelProperties.put("Label Value", new JSONObject().put("type", STRING).put(MIN_LENGTH, 3));
            labelItems.put(PROPERTIES,labelProperties);
            label.put(ITEMS,labelItems);
            properties.put("label",label );
            attributes.put(PROPERTIES, properties);
            List<String> req = new ArrayList<>();
            req.add(MODEL_NAME);
            req.add(VERSION);
            req.add("EnvVariables Name");
            req.add("EnvVariables Value");
            req.add("Ports Name");
            req.add("Ports Value");
            req.add("Labels Name");
            req.add("Labels Value");
            req.add(CONTAINER_IMAGEURI);
            req.add(STORAGE_TYPE);
            req.add(STORAGE_URI);
            attributes.put("required", req);
            JSONObject uischema = new JSONObject();
            uischema.put("type", "VerticalLayout");
            JSONArray elements = new JSONArray();
            elements.put(new JSONObject().put("type", CONTROL).put(SCOPE, "#/properties/Model Name"));
            elements.put(new JSONObject().put("type", CONTROL).put(SCOPE, "#/properties/Version"));
            elements.put(new JSONObject().put("type", CONTROL).put(SCOPE, "#/properties/Description"));
            JSONArray horizontalElements1 = new JSONArray();
            horizontalElements1.put(new JSONObject().put("type", CONTROL).put(SCOPE, "#/properties/env"));
            elements.put(new JSONObject().put("type", HORIZONTAL_LAYOUT).put(ELEMENTS, horizontalElements1));
            JSONArray horizontalElements2 = new JSONArray();
            horizontalElements2.put(new JSONObject().put("type", CONTROL).put(SCOPE, "#/properties/port"));
            elements.put(new JSONObject().put("type", HORIZONTAL_LAYOUT).put(ELEMENTS, horizontalElements2));
            JSONArray horizontalElements3 = new JSONArray();
            horizontalElements3.put(new JSONObject().put("type", CONTROL).put(SCOPE, "#/properties/label"));
            elements.put(new JSONObject().put("type", HORIZONTAL_LAYOUT).put(ELEMENTS, horizontalElements3));
            elements.put(new JSONObject().put("type", CONTROL).put(SCOPE, "#/properties/Health ProbeUri"));
            elements.put(new JSONObject().put("type", CONTROL).put(SCOPE, "#/properties/Container ImageUri"));
            elements.put(new JSONObject().put("type", CONTROL).put(SCOPE, "#/properties/Storage Type"));
            elements.put(new JSONObject().put("type", CONTROL).put(SCOPE, "#/properties/Storage Uri"));
            uischema.put(ELEMENTS, elements);
            ds.put("attributes", attributes);
            ds.put("uischema", uischema);
        	} catch (JSONException e) {
			logger.error(EXCEPTION, e);
		}
		return ds;
	}
	@Override
	public JSONObject getJson() {
		// Method not required in this service class
		return null;
	}
	@Override
	public ICIPPolyAIResponseWrapper listRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException {
		// Method not required in this service class
		return null;
	}
	@Override
	public ICIPMLFederatedModel registerModel(ICIPPolyAIRequestWrapper request) throws IOException, LeapException {
		String strbody = request.getBody();
		JSONObject body = new JSONObject(strbody);
		ICIPMLFederatedModel saveModel = null;
		try {
			saveModel = parseMLFedModel(body, LOCAL_SMALL, LOCAL_SMALL,
					request.getOrganization());
		} catch (ParseException e) {
			logger.error(EXCEPTION, e);
		}
		return saveModel;
	}
	@Override
	public ICIPPolyAIResponseWrapper getRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException {
		// Method not required in this service class
		return null;
	}
	@Override
	public ICIPPolyAIResponseWrapper deployModel(ICIPPolyAIRequestWrapper request) throws IOException, LeapException {
		// Method not required in this service class
		return null;
	}
	@Override
	public ICIPPolyAIResponseWrapper getModelEndpointDetails(ICIPPolyAIRequestWrapper request) throws IOException {
		// Method not required in this service class
		return null;
	}
	@Override
	public ICIPPolyAIResponseWrapper deleteDeployment(ICIPPolyAIRequestWrapper request)
			throws IOException, LeapException {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public List<ICIPMLFederatedModel> getSyncModelList(ICIPPolyAIRequestWrapper request) throws Exception {
		// Method not required in this service class
		return null;
	}
	@Override
	public ICIPPolyAIResponseWrapper listEndpoints(ICIPPolyAIRequestWrapper request) throws IOException {
		// Method not required in this service class
		return null;
	}
	@Override
	public ICIPMLFederatedEndpoint createEndpoint(ICIPPolyAIRequestWrapper request) throws IOException, LeapException {
		String strbody = request.getBody();
		JSONObject body = new JSONObject(strbody);
		ICIPMLFederatedEndpoint saveEndpoint = null;
		try {
			saveEndpoint = parseMLFedEndpoint(body, LOCAL_SMALL, LOCAL_SMALL,
					request.getOrganization());
		} catch (ParseException e) {
			logger.error("error due to:{}", e.getMessage());
		}
		return saveEndpoint;
	}
	@Override
	public ICIPPolyAIResponseWrapper getEndpoint(ICIPPolyAIRequestWrapper request) throws IOException {
		// Method not required in this service class
		return null;
	}
	@Override
	public ICIPPolyAIResponseWrapper getDeploymentStatus(ICIPPolyAIRequestWrapper request) throws IOException {
		// Method not required in this service class
		return null;
	}

	@Override
	public JSONObject getDeployModelJson() {
		// Method not required in this service class
		return null;
	}
	@Override
	public List<ICIPMLFederatedEndpoint> getSyncEndpointList(ICIPPolyAIRequestWrapper payload) throws Exception {
		// Method not required in this service class
		return null;
	}
	@Override
	public ICIPPolyAIResponseWrapper deleteEndpoint(ICIPPolyAIRequestWrapper request)
			throws IOException, LeapException {
		String endpointId = request.getBody();
		ICIPMLFederatedEndpointDTO endpointDto = new ICIPMLFederatedEndpointDTO();
		endpointDto.setAdapterId(request.getName());
		endpointDto.setSourceId(endpointId);
		endpointDto.setOrganisation(request.getOrganization());
		fedEndpointService.updateIsDelEndpoint(endpointDto);
		ICIPPolyAIResponseWrapper wrapResponse = new ICIPPolyAIResponseWrapper();
		wrapResponse.setResponse("Deleted");
		return wrapResponse;
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
    public JSONObject getEndpointJson() {
        JSONObject ds = new JSONObject();
        try {
            ds.put("type", LOCAL);
            JSONObject attributes = new JSONObject();
            attributes.put(ENDPOINT_NAME, "");
            attributes.put("Context Uri", "");
            attributes.put(DESCRIPTION, "");
            attributes.put(SAMPLE, "");
            attributes.put(APPLICATION, "");
            attributes.put(DEPLOYED_MODELS, "");
            attributes.put("Status", "");
            ds.put("attributes", attributes);
        } catch (JSONException e) {
            logger.error(EXCEPTION, e);
        }
        return ds;
    }
	private ICIPMLFederatedModel parseMLFedModel(JSONObject jsonObject, String dsource, String dsrcAlias, String org)
			throws ParseException {
		ICIPMLFederatedModel dto = new ICIPMLFederatedModel();
		FedModelsID fedmodid = new FedModelsID();
		fedmodid.setOrganisation(org);
		ICIPMLFederatedModel  modObj = fedModelRepo.findByDatasourceNameModelNameAndOrganisaton(jsonObject.getString(MODEL_NAME), dsource, org);
		if (modObj !=null) {
			dto = modObj;	
		}
		else {
			dto.setModelName(jsonObject.getString(MODEL_NAME));
			dto.setDescription(jsonObject.has(DESCRIPTION)?jsonObject.getString(DESCRIPTION):"");
		}	
		dto.setCreatedBy("");
		Date createdOn = new Date();
		Timestamp createdOnts = new Timestamp(createdOn.getTime());
		dto.setCreatedOn(createdOnts);
		dto.setModifiedBy("");
		Date date1 = new Date();
		Timestamp ts1 = new Timestamp(date1.getTime());
		if(jsonObject.has(VERSION)) {
			Integer version = jsonObject.getInt(VERSION);
			dto.setVersion(Integer.toString(version));
		}else {
			dto.setVersion("1");
		}
		
		return dto;
	}
	private ICIPMLFederatedEndpoint parseMLFedEndpoint(JSONObject jsonObject, String dsource, String dsrcAlias, String org)
			throws ParseException {
		FedEndpointID fedendpointid = new FedEndpointID();
		fedendpointid.setAdapterId(dsource);
		fedendpointid.setSourceId(jsonObject.getString(ENDPOINT_NAME));
		fedendpointid.setOrganisation(org);
 
		ICIPMLFederatedEndpoint dto = new ICIPMLFederatedEndpoint();
		Optional<ICIPMLFederatedEndpoint> modObj = fedEndpointRepo.findById(fedendpointid);
		if (modObj.isPresent())
			dto = modObj.get();
		else {
			dto.setLikes(0);
			dto.setName(jsonObject.getString(ENDPOINT_NAME));
		}
		dto.setSourceEndpointId(fedendpointid);
		Date createdOn = new Date();
		Timestamp createdOnts = new Timestamp(createdOn.getTime());
		dto.setSyncDate(createdOnts);
		dto.setCreatedOn(createdOnts);
		dto.setSourceModifiedBy("");
		dto.setSourceModifiedDate(createdOnts);
		dto.setSourceName(jsonObject.getString(ENDPOINT_NAME));
		dto.setSourceOrg("");
		dto.setIsDeleted(false);
		dto.setRawPayload(jsonObject.toString());
		dto.setStatus(REGISTERED);
		dto.setCreatedBy("");
		dto.setContextUri(jsonObject.getString("Context Uri"));
		dto.setDeployedModels("");
		dto.setSourcestatus(REGISTERED);
		Date date1 = new Date();
		Timestamp ts1 = new Timestamp(date1.getTime());
		dto.setSyncDate(ts1);
		dto.setType(LOCAL);
		dto.setAdapter(dsrcAlias);
		if(dto.getDescription() != null && !dto.getDescription().isEmpty()) {
			dto.setDescription(dto.getDescription());
		}else {
			dto.setDescription(jsonObject.has(DESCRIPTION)?jsonObject.getString(DESCRIPTION):"");
		}
		if(dto.getDeployedModels() != null && !dto.getDeployedModels().isEmpty()) {
			dto.setDeployedModels(dto.getDeployedModels());
		}else {
			dto.setDeployedModels(jsonObject.has(DEPLOYED_MODELS)?jsonObject.getString(DEPLOYED_MODELS):"");
		}
		if(dto.getSample() != null && !dto.getSample().isEmpty()) {
			dto.setSample(dto.getSample());
		}else {
			dto.setSample(jsonObject.has(SAMPLE)?jsonObject.getString(SAMPLE):"");
		}
		if(dto.getApplication() != null && !dto.getApplication().isEmpty()) {
			dto.setApplication(dto.getApplication());
		}else {
			dto.setApplication(jsonObject.has(APPLICATION)?jsonObject.getString(APPLICATION):"");
		}
		dto.setCreatedBy("");
		return dto;
	}
	@Override
	public ICIPPolyAIResponseWrapper deleteModel(ICIPPolyAIRequestWrapper request)
			throws LeapException, JSONException, IOException {
		// Method not required in this service class
		return null;
	}
		



}
