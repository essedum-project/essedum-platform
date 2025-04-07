package com.infosys.icets.icip.icipmodelserver.v2.service.util;

import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.AICloudPipelineConfig;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.Artifacts;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.Computes;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.Container;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.Framework;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.InputArtifacts;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.JobArgument;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.MetricDetails;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.PreTrainedModelDetails;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.RunArguments;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.TrainingStep;

@Service
public class AICloudService {
	private static final String JA_NAME = "input_file";

	private static final String DEFAULT_VALUE = "";

	private static final String DATA_TYPE = "string";

	private static final String STORAGE_TYPE = "INFY_AICLD_NUTANIX";

	private static final String FW_NAME = "string";

	private static final String FW_VERSION = "string";

	private static final String LOGFILE_URI = "/app/logs/create.log";

	private static final String IMAGE_URI = "infyartifactory.jfrog.io/ainadel-mms-project-customized/codegen-training-pipeline:v1.0";

	private static final String AURI = "s3://aicloudprd/foundational_model/codegen/Salesforce/codegen-350M-multi/";

	private static final String RA_NAME = "input_file";

	private static final String ARG_VALUE = "string";

	private static final Integer MAX_QTY = 5;

	private static final String TYPE = "CPU";

	private static final String MEMORY = "5GB";

	private static final Integer MIN_QTY = 1;

	private static final String OUTPUT_ARTIFACTS = "./eval";

	private static final String PRETRAINED_MODELNAME = "codegen";

	private static final String PRETRAINED_MODELVERSION = "1";

	public JSONArray getJobArguments() {
		JobArgument jobargs = new JobArgument();
		JSONArray js = new JSONArray();
		jobargs.setDataType(DATA_TYPE);
		jobargs.setDefaultValue(DEFAULT_VALUE);
		jobargs.setName(JA_NAME);

		js.put(new JSONObject(jobargs));

		return js;

	}

	public JSONArray getSteps(String storageType, String s3Path, String runcmd, AICloudPipelineConfig pipelinConfig,
			JsonArray environ) {
		JSONArray steps = new JSONArray();
		JSONObject trainingSteps = new JSONObject();
		trainingSteps.put("trainingStep",
				new JSONObject(getTrainingStep(storageType, s3Path, runcmd, pipelinConfig, environ)));
		steps.put(trainingSteps);

		return steps;

	}

	public InputArtifacts getInputArtifacts(String storageType, String s3Path) {

		InputArtifacts ia = new InputArtifacts();
		ia.setStorageType(storageType.toUpperCase());
		ia.setUri(s3Path);
		return ia;
	}

	public JSONObject getStepArgs() {
		JSONObject sas = new JSONObject();
		JSONArray args = new JSONArray();
		args.put(JA_NAME);
		sas.put("jobArgNames", args);

		return sas;
	}

	public TrainingStep getTrainingStep(String storageType, String s3Path, String runcmd,
			AICloudPipelineConfig pipelinConfig, JsonArray environ) {
		TrainingStep tstep = new TrainingStep();
		tstep.setName("create");
		tstep.setInputArtifacts(new JSONObject(getInputArtifacts(storageType, s3Path)));
		// sending defaults
		tstep.setStepArguments(getStepArgs());
		tstep.setContainer(new JSONObject(getContainer(runcmd, pipelinConfig, environ)));
		// sending defaults
		tstep.setFramework(new JSONObject(getFramework(pipelinConfig)));
		// sending defaults
		tstep.setPreTrainedModelDetails(new JSONObject(getPreTrainedModelDetails(pipelinConfig)));
		// sending defaults
		tstep.setMetricDetails(new JSONObject(getMetricDetails()));
		tstep.setOutputArtifactBaseUri(OUTPUT_ARTIFACTS);
		if (pipelinConfig.getOutputArtifactBaseUri() != null)
			tstep.setOutputArtifactBaseUri(pipelinConfig.getOutputArtifactBaseUri());
		return tstep;
	}

	public Container getContainer(String runcmd, AICloudPipelineConfig pipelinConfig, JsonArray environ) {
		Container con = new Container();

		JSONArray environJSON = new JSONArray();
		if (environ.size() != 0) {
			for (int i = 0; i < environ.size(); i++) {
				JsonObject j = environ.get(i).getAsJsonObject();
				JSONObject js = new JSONObject();
				js.put("name", j.get("name").getAsString());
				js.put("value", j.get("value").getAsString());
				environJSON.put(js);
			}
		}
		List<String> runcmds = new ArrayList<>();
		runcmds.add(runcmd);
		con.setCommand(runcmds);
		con.setImageUri(IMAGE_URI);

		if (environJSON.length() != 0) {
			con.setEnvVariables(environJSON);
		}

		if (pipelinConfig.getContainerImageUri() != null)
			con.setImageUri(pipelinConfig.getContainerImageUri());
		return con;
	}

	public Framework getFramework(AICloudPipelineConfig pipelinConfig) {
		Framework fw = new Framework();
		fw.setName(FW_NAME);
		fw.setVersion(FW_VERSION);
		if (pipelinConfig.getFrameworkName() != null && pipelinConfig.getFrameworkVersion() != null) {
			fw.setName(pipelinConfig.getFrameworkName());
			fw.setVersion(pipelinConfig.getFrameworkVersion());
		}

		return fw;
	}

	public MetricDetails getMetricDetails() {

		MetricDetails md = new MetricDetails();
		md.setLogFileUri(LOGFILE_URI);

		return md;

	}

	public PreTrainedModelDetails getPreTrainedModelDetails(AICloudPipelineConfig pipelinConfig) {
		PreTrainedModelDetails ptmd = new PreTrainedModelDetails();

		ptmd.setArtifacts(getArtifacts(pipelinConfig));
		ptmd.setName(PRETRAINED_MODELNAME);
		if (pipelinConfig.getPreTrainedModelName() != null) {
			ptmd.setName(pipelinConfig.getPreTrainedModelName());
		}
		ptmd.setName(PRETRAINED_MODELVERSION);
		if (pipelinConfig.getPreTrainedModelVersion() != null) {
			ptmd.setVersion(pipelinConfig.getPreTrainedModelVersion());
		}
		return ptmd;

	}

	public Artifacts getArtifacts(AICloudPipelineConfig pipelinConfig) {
		Artifacts art = new Artifacts();
		art.setStorageType(STORAGE_TYPE);
		art.setUri(AURI);
		if (pipelinConfig.getPreTrainedModelStorageType() != null && pipelinConfig.getPreTrainedModelUri() != null) {
			art.setStorageType(pipelinConfig.getPreTrainedModelStorageType());
			art.setUri(pipelinConfig.getPreTrainedModelUri());
		}
		return art;

	}

	public JSONArray getRunArguments() {
		RunArguments runargs = new RunArguments();
		JSONArray ra = new JSONArray();
		runargs.setName(RA_NAME);
		runargs.setArgValue(ARG_VALUE);

		ra.put(new JSONObject(runargs));

		return ra;

	}

	public JSONObject getResourceConfig(AICloudPipelineConfig pipelinConfig) {
		JSONObject resourceConfig = new JSONObject();
		new JSONArray();
		resourceConfig.put("computes", getComputes(pipelinConfig));
		resourceConfig.put("volumeSizeinGB", pipelinConfig.getResourceVolumeSize());

		return resourceConfig;

	}

	private JSONArray getComputes(AICloudPipelineConfig pipelinConfig) {
		Computes cm = new Computes();
		JSONArray cma = new JSONArray();
		cm.setMaxQty(MAX_QTY);
		cm.setType(TYPE);
		cm.setMemory(MEMORY);
		cm.setMinQty(MIN_QTY);
		if (pipelinConfig.getResourceMaxQty() != null && pipelinConfig.getResourceMemory() != null
				&& pipelinConfig.getResourceMinQty() != null && pipelinConfig.getResourceType() != null) {
			cm.setMaxQty(Integer.parseInt(pipelinConfig.getResourceMaxQty()));
			cm.setType(pipelinConfig.getResourceType());
			cm.setMemory(pipelinConfig.getResourceMemory());
			cm.setMinQty(Integer.parseInt(pipelinConfig.getResourceMinQty()));
		}

		cma.put(new JSONObject(cm));
		return cma;
	}

	public JSONObject getExperimentConfig() {
		JSONObject expCon = new JSONObject();
		expCon.put("name", "demoexp");
		return expCon;
	}

	

}
