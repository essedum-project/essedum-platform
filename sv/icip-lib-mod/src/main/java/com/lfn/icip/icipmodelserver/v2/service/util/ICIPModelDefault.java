package com.lfn.icip.icipmodelserver.v2.service.util;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.icipmodelserver.model.ICIPPipelineModel;
import com.lfn.icip.icipmodelserver.v2.model.dto.ICIPPolyAIRequestWrapper;
import com.lfn.icip.icipmodelserver.v2.model.dto.ICIPPolyAIResponseWrapper;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedEndpoint;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;

import liquibase.pro.packaged.L;


@Component("defaultmodelservice")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ICIPModelDefault implements IICIPModelServiceUtil {
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPModelDefault.class);

	@Override
	public ICIPPolyAIResponseWrapper getRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public JSONObject getJson() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper listRegisteredModel(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPMLFederatedModel registerModel(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper deployModel(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper getModelEndpointDetails(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper deleteDeployment(ICIPPolyAIRequestWrapper request) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<ICIPMLFederatedModel> getSyncModelList(ICIPPolyAIRequestWrapper request) throws IOException,ParseException {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Override
	public ICIPMLFederatedEndpoint createEndpoint(ICIPPolyAIRequestWrapper request) throws IOException {
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
	public JSONObject getRegisterModelJson() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public JSONObject getEndpointJson() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public JSONObject getDeployModelJson() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<ICIPMLFederatedEndpoint> getSyncEndpointList(ICIPPolyAIRequestWrapper payload) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ICIPPolyAIResponseWrapper deleteEndpoint(ICIPPolyAIRequestWrapper request) throws IOException {
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
	public ICIPPolyAIResponseWrapper deleteModel(ICIPPolyAIRequestWrapper request) {
		// TODO Auto-generated method stub
		return null;
	}



	
}
