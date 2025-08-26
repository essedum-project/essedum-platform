package com.lfn.icip.icipwebeditor.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.factory.IICIPJobRuntimeLoggerServiceUtilFactory;
import com.lfn.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;

@Service
public class ICIPRuntimeLoggerService  {
    @Autowired
	IICIPJobRuntimeLoggerServiceUtilFactory loggerFactory;
    
	public IICIPJobRuntimeLoggerService getJobRuntimeLoggerService(String loggerServiceName) {
		return loggerFactory.getICIPLoggerServiceUtil(loggerServiceName);
	}

	
}
