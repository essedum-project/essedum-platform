package com.lfn.icip.icipmodelserver.v2.factory;

import com.lfn.icip.icipmodelserver.v2.service.util.IICIPMlopsEndpointServiceUtil;
 
/**
 * A factory for creating IICIPModelServiceUtilFactory objects.
 *
 * @author essedum
 */
public interface IICIPEndpointServiceUtilFactory {

	
	IICIPMlopsEndpointServiceUtil getMlopsEndpointServiceUtil(String name);	
}
