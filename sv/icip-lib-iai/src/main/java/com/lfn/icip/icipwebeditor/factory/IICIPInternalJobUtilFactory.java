package com.lfn.icip.icipwebeditor.factory;

import com.lfn.icip.icipwebeditor.IICIPJobServiceUtil;
import com.lfn.icip.icipwebeditor.job.util.InternalJob;

public interface IICIPInternalJobUtilFactory {

	InternalJob getInternalJobServiceUtil(String internalJobServiceName);
}
