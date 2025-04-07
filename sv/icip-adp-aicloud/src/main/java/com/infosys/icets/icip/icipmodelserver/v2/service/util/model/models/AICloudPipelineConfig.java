package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AICloudPipelineConfig {
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
	String outputArtifactBaseUri;
	String bucketName;
	//changes by ankit
	String pipelineName;
	String imageUri;
	String elasticDatasource;
	String elasticSearchIndex;
	String step1script;
	String step2script;
	String data_path;
	String request_id;
	String temp_path;
	String dsStorageType;
	String dsName;
	String dsUri;
	String volume_scope;
	String volume_name;
	String volume_mountPath;
	String volume_sizeinGB;
	
	
}
