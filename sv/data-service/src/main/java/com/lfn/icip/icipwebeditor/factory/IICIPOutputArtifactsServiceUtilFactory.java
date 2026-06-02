
package com.lfn.icip.icipwebeditor.factory;
import com.lfn.icip.icipwebeditor.service.IICIPOutputArtifactsService;


public interface IICIPOutputArtifactsServiceUtilFactory {
	IICIPOutputArtifactsService getICIPOutputArtifactsServiceUtil(String outputArtifactsServiceName);
}