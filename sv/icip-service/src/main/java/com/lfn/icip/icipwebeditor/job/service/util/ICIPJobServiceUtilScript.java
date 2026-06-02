/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.icipwebeditor.job.service.util;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.dataset.service.impl.ICIPDatasetService;
import com.lfn.icip.icipwebeditor.IICIPJobServiceUtil;
import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.job.constants.JobConstants;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.model.dto.ICIPNativeJobDetails;
import com.lfn.icip.icipwebeditor.service.impl.ICIPStreamingServiceService;
import com.lfn.icip.icipwebeditor.util.ICIPJsonVisitorGetDagsterScript;
import com.lfn.icip.icipwebeditor.util.ICIPJsonVisitorGetInput;
import com.lfn.icip.icipwebeditor.util.ICIPJsonVisitorGetOutput;
import com.lfn.icip.icipwebeditor.util.ICIPJsonWalker;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
//
/**
 * The Class ICIPJobServiceUtilScript.
 *
 * @author essedum
 */

@Component("scriptjob")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope

/** The Constant log. */
@Log4j2
public class ICIPJobServiceUtilScript extends ICIPCommonJobServiceUtil implements IICIPJobServiceUtil {

	/**
	 * Instantiates a new ICIP job service util script.
	 */
	public ICIPJobServiceUtilScript() {
		super();
	}

	/** The dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;

	/** The streaming service. */
	@Autowired
	private ICIPStreamingServiceService streamingService;

	/** The script command. */
	@EssedumProperty("icip.pipeline.script.command")
	private String scriptCommand;

	/**
	 * Gets the command.
	 *
	 * @param jobDetails the job details
	 * @return the command
	 * @throws EssedumException the essedum exception
	 */
	@Override
	public String getCommand(ICIPNativeJobDetails jobDetails) throws EssedumException {
		ICIPStreamingServices ss = streamingService.getICIPStreamingServicesRefactored(jobDetails.getCname(),
				jobDetails.getOrg());

		String jsonContent;
		try {
			jsonContent = ss.getJsonContent();
		} catch (Exception ex) {
			String msg = "Error in getting json content : " + ex.getClass().getCanonicalName() + " - "
					+ ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		String org = jobDetails.getOrg();
		String cmdStr;
		log.info("running script pipeline");
		JsonElement jsonElement = gson.fromJson(jsonContent, JsonElement.class);
		ICIPJsonVisitorGetDagsterScript visitor = new ICIPJsonVisitorGetDagsterScript();

		try {
			ICIPJsonWalker.walk(jsonElement, visitor, org);
		} catch (Exception ex) {
			String msg = "Error in getting dagster script : " + ex.getClass().getCanonicalName() + " - "
					+ ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		StringBuilder script = visitor.getScript();
		ICIPJsonVisitorGetInput visitorInput = new ICIPJsonVisitorGetInput();

		try {
			ICIPJsonWalker.walk(gson.fromJson(jsonContent, JsonElement.class), visitorInput, org);
		} catch (Exception ex) {
			String msg = "Error in getting input : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		StringBuilder inputBuilder = new StringBuilder("[");
		List<String> inputs = visitorInput.getInput();
		inputs.forEach(input -> {
			inputBuilder.append(extractNameFromIO(gson, input, org));
			inputBuilder.append(",");
		});
		inputBuilder.delete(inputBuilder.length() - 1, inputBuilder.length());
		inputBuilder.append("]");

		ICIPJsonVisitorGetOutput visitorOutput = new ICIPJsonVisitorGetOutput();

		try {
			ICIPJsonWalker.walk(gson.fromJson(jsonContent, JsonElement.class), visitorOutput, org);
		} catch (Exception ex) {
			String msg = "Error in getting output : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		StringBuilder outputBuilder = new StringBuilder("[");
		List<String> outputs = visitorOutput.getOutput();
		outputs.forEach(output -> {
			outputBuilder.append(extractNameFromIO(gson, output, org));
			outputBuilder.append(",");
		});
		outputBuilder.delete(outputBuilder.length() - 1, outputBuilder.length());
		outputBuilder.append("]");

		String dbparams = null;
		Object dbparamsObject = getAttributes(jsonElement).get(JobConstants.PARAMS);
		if (dbparamsObject != null) {
			JsonObject dbParamsJson = (JsonObject) dbparamsObject;
			String paramsStr = jobDetails.getParams();
			if (paramsStr != null && !paramsStr.trim().isEmpty() && !paramsStr.trim().equals("{}")) {
				JsonObject userParamsJson = gson.fromJson(paramsStr, JsonObject.class);
				userParamsJson.keySet().parallelStream().forEach(key -> dbParamsJson.add(key, userParamsJson.get(key)));
			}
			addTriggerTime(dbParamsJson, jobDetails.getTriggerValues());
			dbparams = dbParamsJson.toString();
		}

		writeTempFile(script, jobDetails.getPytempFile());
		writeTempFile(createYamlscript(inputBuilder, outputBuilder, dbparams), jobDetails.getYamltempFile());

		cmdStr = resolveCommand(scriptCommand,
				new String[] { jobDetails.getPytempFile().toAbsolutePath().toString(), jobDetails.getCname() });
		return cmdStr;
	}

	/**
	 * Extract name from IO.
	 *
	 * @param gson  the gson
	 * @param input the input
	 * @param org   the org
	 * @return the string
	 */
	private String extractNameFromIO(Gson gson, String input, String org) {
		try {
			gson.fromJson(input, JsonElement.class).getAsJsonObject();
			return input;
		} catch (Exception ex) {
			log.error("Not a JSON : {} - {}", input, ex.getMessage());
			return gson.toJson(datasetService.getDataset(input, org));
		}
	}

	/**
	 * Creates the yamlscript.
	 *
	 * @param input  the input
	 * @param output the output
	 * @param params the params
	 * @return the string builder
	 * @throws EssedumException the essedum exception
	 */
	private StringBuilder createYamlscript(StringBuilder input, StringBuilder output, String params)
			throws EssedumException {
		try {
			log.info("creating yaml script for script pipeline");
			Yaml yaml = new Yaml();
			Map<String, Object> root = new HashMap<>();
			Map<String, Object> solids = new HashMap<>();
			Map<String, Object> getData = new HashMap<>();
			Map<String, Object> getDataInputs = new HashMap<>();
			Map<String, Object> inputDatasetConfig = new HashMap<>();
			Map<String, Object> outputDatasetConfig = new HashMap<>();

			Map<String, Object> transform = new HashMap<>();
			Map<String, Object> inputs = new HashMap<>();
			Map<String, Object> saveData = new HashMap<>();
			Map<String, Object> saveDataInputs = new HashMap<>();
			Map<String, Object> inputparams = new HashMap<>();

			solids.put(IAIJobConstants.GETDATA, getData);
			solids.put(IAIJobConstants.SAVEDATA, saveData);

			solids.put(IAIJobConstants.TRANSFORM, transform);
			transform.put(IAIJobConstants.INPUTS, inputs);
			inputs.put(JobConstants.PARAMS, inputparams);
			inputparams.put(IAIJobConstants.VALUE, params);

			getData.put(IAIJobConstants.INPUTS, getDataInputs);
			getDataInputs.put(IAIJobConstants.IPDATASETCONFIG, inputDatasetConfig);
			inputDatasetConfig.put(IAIJobConstants.VALUE, input.toString());

			saveData.put(IAIJobConstants.INPUTS, saveDataInputs);
			saveDataInputs.put(IAIJobConstants.OPDATASETCONFIG, outputDatasetConfig);
			outputDatasetConfig.put(IAIJobConstants.VALUE, output.toString());

			root.put(IAIJobConstants.SOLIDS, solids);
			root.put(IAIJobConstants.LOGGERS, getLoggersValue());

			return new StringBuilder().append(yaml.dump(root));
		} catch (Exception ex) {
			String msg = "Error in creating yaml script : " + ex.getClass().getCanonicalName() + " - "
					+ ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}
	}

	/**
	 * Gets the attributes.
	 *
	 * @param jsonElement the json element
	 * @return the attributes
	 * @throws EssedumException the essedum exception
	 */
	private JsonObject getAttributes(JsonElement jsonElement) throws EssedumException {
		try {
			return new Gson().fromJson(jsonElement, JsonElement.class).getAsJsonObject().get("elements")
					.getAsJsonArray().get(0).getAsJsonObject().get("attributes").getAsJsonObject();
		} catch (Exception ex) {
			String msg = "Error in fetching elements[0].attributes : " + ex.getClass().getCanonicalName() + " - "
					+ ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}
	}

	@Override
	public Path getFilePath(ICIPNativeJobDetails jobDetails) {
		// TODO Auto-generated method stub
		return null;
	}

}
