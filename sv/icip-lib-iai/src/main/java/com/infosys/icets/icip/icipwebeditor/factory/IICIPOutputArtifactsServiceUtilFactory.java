
package com.infosys.icets.icip.icipwebeditor.factory;
import com.infosys.icets.icip.icipwebeditor.service.IICIPOutputArtifactsService;


public interface IICIPOutputArtifactsServiceUtilFactory {
	IICIPOutputArtifactsService getICIPOutputArtifactsServiceUtil(String outputArtifactsServiceName);
}