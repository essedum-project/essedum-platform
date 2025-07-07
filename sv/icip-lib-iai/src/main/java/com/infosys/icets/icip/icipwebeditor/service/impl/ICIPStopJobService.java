package com.infosys.icets.icip.icipwebeditor.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.icets.icip.icipwebeditor.factory.IICIPJobRuntimeLoggerServiceUtilFactory;
import com.infosys.icets.icip.icipwebeditor.factory.IICIPStopJobServiceUtilFactory;
import com.infosys.icets.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStopJobService;

@Service
public class ICIPStopJobService {
	@Autowired
	IICIPStopJobServiceUtilFactory stopJobFactory;
	public IICIPStopJobService getStopJobService(String stopJobServiceName) {
		return stopJobFactory.getICIPStopJobServiceUtil(stopJobServiceName);
	}
}