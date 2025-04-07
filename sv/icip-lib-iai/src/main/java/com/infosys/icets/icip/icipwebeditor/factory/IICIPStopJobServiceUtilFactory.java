package com.infosys.icets.icip.icipwebeditor.factory;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStopJobService;

public interface IICIPStopJobServiceUtilFactory {
	IICIPStopJobService getICIPStopJobServiceUtil(String stopJobServiceName);
}
