package com.infosys.icets.icip.icipmodelserver.v2.factory;

import com.infosys.icets.icip.icipmodelserver.v2.service.util.IICIPMlopsEndpointServiceUtil;
 
/**
 * A factory for creating IICIPModelServiceUtilFactory objects.
 *
 * @author icets
 */
public interface IICIPEndpointServiceUtilFactory {

	
	IICIPMlopsEndpointServiceUtil getMlopsEndpointServiceUtil(String name);	
}
