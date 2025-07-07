package com.infosys.icets.icip.icipmodelserver.v2.service;

import com.infosys.icets.icip.icipmodelserver.v2.service.util.IICIPMlopsEndpointServiceUtil;

public interface IICIPEndpointPluginsService {

	IICIPMlopsEndpointServiceUtil getMlopsEndpointService(String type);


}
