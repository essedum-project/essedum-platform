package com.lfn.icip.icipmodelserver.v2.service.util;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;

import com.lfn.ai.comm.lib.util.exceptions.LeapException;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.icipmodelserver.model.ICIPPipelineModel;
import com.lfn.icip.icipmodelserver.v2.model.dto.ICIPPolyAIRequestWrapper;
import com.lfn.icip.icipmodelserver.v2.model.dto.ICIPPolyAIResponseWrapper;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;

public interface IICIPModelServiceUtil {

	public JSONObject getJson();

	public ICIPPolyAIResponseWrapper listRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception;

	public ICIPMLFederatedModel registerModel(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception;

	public ICIPPolyAIResponseWrapper getRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception;

	ICIPPolyAIResponseWrapper deployModel(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception;

	ICIPPolyAIResponseWrapper getModelEndpointDetails(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception;

	ICIPPolyAIResponseWrapper deleteDeployment(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception;
	
	List<ICIPMLFederatedModel> getSyncModelList(ICIPPolyAIRequestWrapper request) throws Exception;
	
	ICIPPolyAIResponseWrapper listEndpoints(ICIPPolyAIRequestWrapper request)throws IOException, LeapException, Exception;

	ICIPMLFederatedEndpoint createEndpoint(ICIPPolyAIRequestWrapper request)throws IOException, LeapException, Exception;

	ICIPPolyAIResponseWrapper getEndpoint(ICIPPolyAIRequestWrapper request)throws IOException, LeapException, Exception;


	ICIPPolyAIResponseWrapper getDeploymentStatus(ICIPPolyAIRequestWrapper request)throws IOException, LeapException, Exception;

	JSONObject getRegisterModelJson();

	JSONObject getEndpointJson();

	JSONObject getDeployModelJson();

	List<ICIPMLFederatedEndpoint> getSyncEndpointList(ICIPPolyAIRequestWrapper payload) throws Exception;

	ICIPPolyAIResponseWrapper deleteEndpoint(ICIPPolyAIRequestWrapper request) throws IOException, LeapException, Exception;

	ICIPPolyAIResponseWrapper updateDeployment(ICIPPolyAIRequestWrapper request) throws IOException;

	ICIPPolyAIResponseWrapper createModelDeployment(ICIPPolyAIRequestWrapper request) throws IOException;

	public ICIPPolyAIResponseWrapper deleteModel(ICIPPolyAIRequestWrapper request) throws LeapException, JSONException, IOException, Exception;
}
