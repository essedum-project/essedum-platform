package com.lfn.icip.icipmodelserver.v2.service;

import com.lfn.icip.icipmodelserver.v2.service.util.IICIPMlopsEndpointServiceUtil;

public interface IICIPEndpointPluginsService {

	IICIPMlopsEndpointServiceUtil getMlopsEndpointService(String type);


}
