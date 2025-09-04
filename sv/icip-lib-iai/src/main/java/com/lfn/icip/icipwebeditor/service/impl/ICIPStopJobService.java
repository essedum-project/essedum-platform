package com.lfn.icip.icipwebeditor.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.factory.IICIPJobRuntimeLoggerServiceUtilFactory;
import com.lfn.icip.icipwebeditor.factory.IICIPStopJobServiceUtilFactory;
import com.lfn.icip.icipwebeditor.service.IICIPJobRuntimeLoggerService;
import com.lfn.icip.icipwebeditor.service.IICIPStopJobService;

@Service
public class ICIPStopJobService {
	@Autowired
	IICIPStopJobServiceUtilFactory stopJobFactory;
	public IICIPStopJobService getStopJobService(String stopJobServiceName) {
		return stopJobFactory.getICIPStopJobServiceUtil(stopJobServiceName);
	}
}