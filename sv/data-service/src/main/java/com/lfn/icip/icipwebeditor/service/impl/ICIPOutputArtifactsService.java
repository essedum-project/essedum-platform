package com.lfn.icip.icipwebeditor.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.icip.icipwebeditor.factory.IICIPOutputArtifactsServiceUtilFactory;
import com.lfn.icip.icipwebeditor.service.IICIPOutputArtifactsService;


@Service
public class ICIPOutputArtifactsService {
	@Autowired
	IICIPOutputArtifactsServiceUtilFactory outputArtifactsFactory;
	public IICIPOutputArtifactsService getOutputArtifactsService(String outputArtifactsServiceName) {
		return outputArtifactsFactory.getICIPOutputArtifactsServiceUtil(outputArtifactsServiceName);
	}
}