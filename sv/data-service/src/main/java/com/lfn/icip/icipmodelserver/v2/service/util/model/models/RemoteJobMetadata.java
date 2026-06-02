package com.lfn.icip.icipmodelserver.v2.service.util.model.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RemoteJobMetadata {

	private String taskId;
	private String status;
	private String taskName;
	private String projectId;
	private String datasourceName;
	private String bucketName;
	private String tag;
	private String logFilePath;
	private String pipelineName;

	
}