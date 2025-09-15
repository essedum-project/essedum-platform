package com.lfn.icip.icipwebeditor.factory;
import com.lfn.icip.icipwebeditor.service.IICIPStopJobService;

public interface IICIPStopJobServiceUtilFactory {
	IICIPStopJobService getICIPStopJobServiceUtil(String stopJobServiceName);
}
