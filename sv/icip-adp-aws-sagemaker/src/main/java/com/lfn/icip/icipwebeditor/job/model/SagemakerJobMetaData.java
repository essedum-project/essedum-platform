package com.lfn.icip.icipwebeditor.job.model;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SagemakerJobMetaData {
	private String bucketName;
	private String datasourceName;
	private String pipelineName;
	private String logFilePath;
	private String tag;
	private String processArn;
	private String processingJobName;
}
