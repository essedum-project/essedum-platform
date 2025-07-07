package com.infosys.icets.icip.icipwebeditor.factory;

import com.infosys.icets.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;

public interface IICIPJobRuntimeLoggerServiceUtilFactory {
	
	IICIPJobRuntimeLoggerService getICIPLoggerServiceUtil(String loggerServiceName);

}
