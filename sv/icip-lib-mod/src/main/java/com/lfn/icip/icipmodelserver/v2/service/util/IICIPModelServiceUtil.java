package com.lfn.icip.icipmodelserver.v2.service.util;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;

import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.icipmodelserver.model.ICIPPipelineModel;
import com.lfn.icip.icipmodelserver.v2.model.dto.ICIPPolyAIRequestWrapper;
import com.lfn.icip.icipmodelserver.v2.model.dto.ICIPPolyAIResponseWrapper;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;

public interface IICIPModelServiceUtil {

	public JSONObject getJson();

	public ICIPPolyAIResponseWrapper listRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException, EssedumException, Exception;

	public ICIPMLFederatedModel registerModel(ICIPPolyAIRequestWrapper request) throws IOException, EssedumException, Exception;

	public ICIPPolyAIResponseWrapper getRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException, EssedumException, Exception;

	ICIPPolyAIResponseWrapper deployModel(ICIPPolyAIRequestWrapper request) throws IOException, EssedumException, Exception;

	ICIPPolyAIResponseWrapper getModelEndpointDetails(ICIPPolyAIRequestWrapper request) throws IOException, EssedumException, Exception;

	ICIPPolyAIResponseWrapper deleteDeployment(ICIPPolyAIRequestWrapper request) throws IOException, EssedumException, Exception;
	
	List<ICIPMLFederatedModel> getSyncModelList(ICIPPolyAIRequestWrapper request) throws Exception;
	
	ICIPPolyAIResponseWrapper listEndpoints(ICIPPolyAIRequestWrapper request)throws IOException, EssedumException, Exception;

	ICIPMLFederatedEndpoint createEndpoint(ICIPPolyAIRequestWrapper request)throws IOException, EssedumException, Exception;

	ICIPPolyAIResponseWrapper getEndpoint(ICIPPolyAIRequestWrapper request)throws IOException, EssedumException, Exception;


	ICIPPolyAIResponseWrapper getDeploymentStatus(ICIPPolyAIRequestWrapper request)throws IOException, EssedumException, Exception;

	JSONObject getRegisterModelJson();

	JSONObject getEndpointJson();

	JSONObject getDeployModelJson();

	List<ICIPMLFederatedEndpoint> getSyncEndpointList(ICIPPolyAIRequestWrapper payload) throws Exception;

	ICIPPolyAIResponseWrapper deleteEndpoint(ICIPPolyAIRequestWrapper request) throws IOException, EssedumException, Exception;

	ICIPPolyAIResponseWrapper updateDeployment(ICIPPolyAIRequestWrapper request) throws IOException;

	ICIPPolyAIResponseWrapper createModelDeployment(ICIPPolyAIRequestWrapper request) throws IOException;

	public ICIPPolyAIResponseWrapper deleteModel(ICIPPolyAIRequestWrapper request) throws EssedumException, JSONException, IOException, Exception;
}
