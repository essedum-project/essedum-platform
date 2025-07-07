package com.infosys.icets.icip.icipmodelserver.v2.factory;

import com.infosys.icets.icip.icipmodelserver.v2.service.util.IICIPModelServiceUtil;
 
/**
 * A factory for creating IICIPModelServiceUtilFactory objects.
 *
 * @author icets
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
