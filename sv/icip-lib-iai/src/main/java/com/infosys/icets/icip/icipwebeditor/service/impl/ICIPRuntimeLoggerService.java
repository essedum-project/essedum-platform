package com.infosys.icets.icip.icipwebeditor.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.icets.icip.icipwebeditor.factory.IICIPJobRuntimeLoggerServiceUtilFactory;
import com.infosys.icets.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;

@Service
public class ICIPRuntimeLoggerService  {
    @Autowired
	IICIPJobRuntimeLoggerServiceUtilFactory loggerFactory;
    
	public IICIPJobRuntimeLoggerService getJobRuntimeLoggerService(String loggerServiceName) {
		return loggerFactory.getICIPLoggerServiceUtil(loggerServiceName);
	}

	
}
