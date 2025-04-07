package com.infosys.icets.icip.icipmodelserver.v2.service.util;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Random;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.AICloudPipelineConfig;

@Service
public class AICloudServiceV2 {

	private static final String PIPELINE_OPERATOR = "kubeflow";

	private static final String PIPELINE_RUNTIME = "kubernetes";

	private static final String DS_STORAGETYPE = "INFY_AICLD_MINIO";

	private static final String DS_NAME = "minio";

	private static final String DS_URI = "s3://";

	private static final String IA_STORAGETYPE = "INFY_AICLD_NUTANIX";

	private static final String IA_NAME = "nutanix";

	private static final String IA_URI = "s3://{bucket_name}/{folder_path}";
	private static final String FLOW_STEPTYPE = "generic";

	private static final String FS1_INPUTDATE_PATH = "./input/dummy_file.txt";
	private static final String FS1_INPUTREQUEST_ID = "123456789";
	private static final String FS1_OUTPUT_PATH = "/output_path.txt";
	private static final String FS1_OUTPUT_STRING = "/strings.txt";
	private static final String FS1_OUTPUT_REQUEST_ID = "/request_id.txt";
	private static final String IMAGE_URI = "infyartifactory.jfrog.io/ainadel-mms-pipeline/count_words:v5";

	private static final String FS1_OUTPUT = "/output.json";

	private static final Integer MAX_QTY = 5;

	private static final String TYPE = "CPU";

	private static final String MEMORY = "10GB";

	private static final Integer MIN_QTY = 1;
	private static final Integer VOLUMESIZE_INGB = 10;

	private static final String VAR_DATA_PATH = "./input/dummy_file.txt";
	private static final String VAR_REQUEST_ID = "123456789";
	private static final String VAR_TEMP_PATH = "";

	private static final String GLO_VAR_NAME_1 = "";
	private static final String GLO_VAR_MINIO_URI = "";

	// input artifacts uri
	private static final String AURI = "s3://aicloudprd/foundational_model/codegen/Salesforce/codegen-350M-multi/";
	private static final String SCOPE = "pipeline";
	private static final String NAME = "pvc-model-repo";
	private static final String MOUNT_PATH = "/mnt/models";
	private static final Integer SIZE_IN_GB = 10;
	private static String classS3path = "";
	
	private static final String STORAGE_TYPE = "storageType";
	private static final String DATA_PATH = "data_path";
	private static final String REQUEST_ID = "request_id";
	private static final String TEMP_PATH = "temp_path";
	
	private static final SecureRandom random = new SecureRandom();
	
	public JsonObject getPipeline(AICloudPipelineConfig pipelinConfig, String nativeJobDetails, Integer version,
			String s3path, String pythonFile, JsonObject envV2, JsonObject flow) {
		AICloudServiceV2.classS3path = s3path;
		JsonObject pipeline = new JsonObject();
		int randomInt = random.nextInt(1000);
		String pipelineName = "my-pipeline-" + randomInt;
		pipeline.addProperty("name", pipelineName);
		
		
		pipeline.addProperty("version", version);
		pipeline.addProperty("operator", PIPELINE_OPERATOR);
		pipeline.addProperty("runtime", PIPELINE_RUNTIME);

		JsonObject dataStorage = new JsonObject();

		if ((pipelinConfig.getDsName() != null) && (pipelinConfig.getDsStorageType() != null)
				&& (pipelinConfig.getDsUri() != null)) {
			dataStorage.addProperty(STORAGE_TYPE, pipelinConfig.getDsStorageType());
			dataStorage.addProperty("name", pipelinConfig.getDsName());
			dataStorage.addProperty("uri", pipelinConfig.getDsUri());
		} else {
			dataStorage.addProperty(STORAGE_TYPE, DS_STORAGETYPE);
			dataStorage.addProperty("name", DS_NAME);
			dataStorage.addProperty("uri", DS_URI);
		}
		JsonArray dsArray = new JsonArray();
		dsArray.add(dataStorage);

		pipeline.add("dataStorage", dsArray);

		
		 JsonObject volume = new JsonObject(); 
		 if((pipelinConfig.getVolume_scope()!= null) && (pipelinConfig.getVolume_name()!= null) && (pipelinConfig.getVolume_sizeinGB()!= null) && (pipelinConfig.getVolume_mountPath()!= null) ) {
		  volume.addProperty("scope",pipelinConfig.getVolume_scope() );
		  volume.addProperty("name", pipelinConfig.getVolume_name()); 
		  volume.addProperty("mountPath", pipelinConfig.getVolume_mountPath());
		  volume.addProperty("sizeinGB",Integer.parseInt(pipelinConfig.getVolume_sizeinGB()));
		  
		  pipeline.add("volume", volume);
		 }
		 

		pipeline.add("flow", flow);

		JsonObject variables = new JsonObject();

		if ((pipelinConfig.getData_path() != null) && (pipelinConfig.getRequest_id() != null)
				&& (pipelinConfig.getTemp_path() != null)) {
			variables.addProperty(DATA_PATH, pipelinConfig.getData_path());
			variables.addProperty(REQUEST_ID, pipelinConfig.getRequest_id());
			variables.addProperty(TEMP_PATH, pipelinConfig.getTemp_path());
		} else {
			variables.addProperty(DATA_PATH, VAR_DATA_PATH);
			variables.addProperty(REQUEST_ID, VAR_REQUEST_ID);
			variables.addProperty(TEMP_PATH, VAR_TEMP_PATH);
		}

		pipeline.add("variables", variables);

		pipeline.add("globalVariables", envV2);

		return pipeline;
	}

	public JsonObject getExecutePipeline(JsonObject envV2, String s3path, AICloudPipelineConfig pipelinConfig) {
		JsonObject executePipeline = new JsonObject();

		JsonObject dataStorage = new JsonObject();
		if ((pipelinConfig.getDsName() != null) && (pipelinConfig.getDsStorageType() != null)
				&& (pipelinConfig.getDsUri() != null)) {
			dataStorage.addProperty(STORAGE_TYPE, pipelinConfig.getDsStorageType());
			dataStorage.addProperty("name", pipelinConfig.getDsName());
			dataStorage.addProperty("uri", pipelinConfig.getDsUri());
		} else {
			dataStorage.addProperty(STORAGE_TYPE, DS_STORAGETYPE);
			dataStorage.addProperty("name", DS_NAME);
			dataStorage.addProperty("uri", DS_URI);
		}
		JsonArray dsArray = new JsonArray();
		dsArray.add(dataStorage);

		executePipeline.add("dataStorage", dsArray);

		JsonObject variables = new JsonObject();

		if ((pipelinConfig.getData_path() != null) && (pipelinConfig.getRequest_id() != null)
				&& (pipelinConfig.getTemp_path() != null)) {
			variables.addProperty(DATA_PATH, pipelinConfig.getData_path());
			variables.addProperty(REQUEST_ID, pipelinConfig.getRequest_id());
			variables.addProperty(TEMP_PATH, pipelinConfig.getTemp_path());
		} else {
			variables.addProperty(DATA_PATH, VAR_DATA_PATH);
			variables.addProperty(REQUEST_ID, VAR_REQUEST_ID);
			variables.addProperty(TEMP_PATH, VAR_TEMP_PATH);
		}
		executePipeline.add("variables", variables);

		executePipeline.add("globalVariables", envV2);

		return executePipeline;
	}
}
