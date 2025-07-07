package com.infosys.icets.icip.icipwebeditor.factory;

import com.infosys.icets.icip.icipwebeditor.IICIPJobServiceUtil;
import com.infosys.icets.icip.icipwebeditor.job.util.InternalJob;

public interface IICIPInternalJobUtilFactory {

	InternalJob getInternalJobServiceUtil(String internalJobServiceName);
}
