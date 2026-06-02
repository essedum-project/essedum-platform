package com.lfn.icip.icipmodelserver.v2.factory;

import com.lfn.icip.icipmodelserver.v2.service.util.IICIPModelServiceUtil;
 
/**
 * A factory for creating IICIPModelServiceUtilFactory objects.
 *
 * @author essedum
 */
public interface IICIPModelServiceUtilFactory {
	
	/**
	 * Gets the models util.
	 *
	 * @param name the name
	 * @return the model util
	 */
	IICIPModelServiceUtil getModelServiceUtil(String name);	
		
}
