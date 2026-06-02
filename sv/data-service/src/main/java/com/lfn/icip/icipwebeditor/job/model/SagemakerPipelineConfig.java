package com.lfn.icip.icipwebeditor.job.model;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SagemakerPipelineConfig {
	String storageType;
	String preTrainedModelStorageType;
	String preTrainedModelUri;
	String frameworkName;
	String frameworkVersion;
	String containerImageUri;
	String preTrainedModelName;
	String preTrainedModelVersion;
	String pipelineScope;
	String projectId;
	String modelName;
	String modelVersion;
	String resourceMaxQty;
	String resourceMinQty;
	String resourceMemory;
	String resourceType;
	String resourceVolumeSize;
}
