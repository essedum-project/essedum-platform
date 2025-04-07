package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AlCloudJobMetaDataV2 {

	private String executePipelineId;
	private String executePipelineName;
	private String projectId;
	private String logFilePath;
	private String aiCloudPipelineId;
	private String bucketName;
	private String pipelineName;
	private String datasourceName;
	private String tag;
	private String elastic;
    private String elasticSearchIndex;
	
}
