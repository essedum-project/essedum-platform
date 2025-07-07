package com.infosys.icets.icip.icipwebeditor.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.icets.icip.icipwebeditor.factory.IICIPOutputArtifactsServiceUtilFactory;
import com.infosys.icets.icip.icipwebeditor.service.IICIPOutputArtifactsService;


@Service
public class ICIPOutputArtifactsService {
	@Autowired
	IICIPOutputArtifactsServiceUtilFactory outputArtifactsFactory;
	public IICIPOutputArtifactsService getOutputArtifactsService(String outputArtifactsServiceName) {
		return outputArtifactsFactory.getICIPOutputArtifactsServiceUtil(outputArtifactsServiceName);
	}
}