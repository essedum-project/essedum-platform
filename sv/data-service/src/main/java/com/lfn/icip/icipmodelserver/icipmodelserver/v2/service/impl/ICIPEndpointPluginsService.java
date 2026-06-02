package com.lfn.icip.icipmodelserver.v2.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipmodelserver.v2.factory.IICIPEndpointServiceUtilFactory;
import com.lfn.icip.icipmodelserver.v2.service.IICIPEndpointPluginsService;
import com.lfn.icip.icipmodelserver.v2.service.util.IICIPMlopsEndpointServiceUtil;

// 
/**
 * The Class ICIPDatasourcePluginsService.
 *
 * @author essedum
 */
@Service
public class ICIPEndpointPluginsService implements IICIPEndpointPluginsService {

	/** The model factory. */
	@Autowired
	private IICIPEndpointServiceUtilFactory endpointFactory;
	

	
	@Override
	public IICIPMlopsEndpointServiceUtil getMlopsEndpointService(String type) {
		return endpointFactory.getMlopsEndpointServiceUtil(String.format("%s%s", type.toLowerCase(), "endpoint"));
	}
	


}
