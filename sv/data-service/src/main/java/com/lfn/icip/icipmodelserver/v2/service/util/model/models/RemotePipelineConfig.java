package com.lfn.icip.icipmodelserver.v2.service.util.model.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RemotePipelineConfig {
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
	String runCommand;
	String container;
	String bucket;
	String instance_count;
	String source;
	String role;
	String pyVersion;
    String instanceType;
}