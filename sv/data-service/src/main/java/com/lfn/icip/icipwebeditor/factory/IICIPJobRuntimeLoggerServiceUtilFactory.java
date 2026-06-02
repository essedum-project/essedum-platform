package com.lfn.icip.icipwebeditor.factory;

import com.lfn.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;

public interface IICIPJobRuntimeLoggerServiceUtilFactory {
	
	IICIPJobRuntimeLoggerService getICIPLoggerServiceUtil(String loggerServiceName);

}
