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

package com.infosys.icets.icip.icipwebeditor.job.service.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
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
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.IICIPJobServiceUtil;
import com.infosys.icets.icip.icipwebeditor.constants.IAIJobConstants;
import com.infosys.icets.icip.icipwebeditor.job.constants.JobConstants;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPNativeJobDetails;
import com.infosys.icets.icip.icipwebeditor.service.aspect.IAIResolverAspect;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPPipelineService;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPJobServiceUtilAzure.
 *
 * @author icets
 */
@Component("azurejob")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope

/** The Constant log. */
@Log4j2
public class ICIPJobServiceUtilAzure extends ICIPCommonJobServiceUtil implements IICIPJobServiceUtil {

	/**
	 * Instantiates a new ICIP job service util drag and drop.
	 */
	public ICIPJobServiceUtilAzure() {
		super();
	}

	/** The pipeline service. */
	@Autowired
	private ICIPPipelineService pipelineService;

	/** The annotation service util. */
	@Autowired
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;

	/** The resolver. */
	@Autowired
	private IAIResolverAspect resolver;

	/** The drag and drop command. */
	@LeapProperty("icip.pipeline.draganddrop.command")
	private String dragAndDropCommand;

	/** The drag and drop command with rest node. */
	@LeapProperty("icip.pipeline.draganddrop.restnode.command")
	private String dragAndDropCommandWithRestNode;

	@LeapProperty("icip.pipelineScript.directory")
	private String pipelineScriptPath;

	/**
	 * Gets the command.
	 *
	 * @param jobDetails the job details
	 * @return the command
	 * @throws LeapException the leap exception
	 */
	@Override
	public String getCommand(ICIPNativeJobDetails jobDetails) throws LeapException {
		String cname = jobDetails.getCname();
		String org = jobDetails.getOrg();
		String params = jobDetails.getParams();
		String cmdStr;
		log.info("running azure pipeline");
		String data = pipelineService.getJson(cname, org);
		JsonObject correlationJson = new JsonObject();
		if (jobDetails.isRestNode()) {
			try {
				correlationJson = createCorrelationFile(params, jobDetails.getId(),
						IAIJobConstants.CORRELATIONFILEDIRECTORY);
			} catch (IOException ex) {
				String msg = "Error in creating correlation file : " + ex.getClass().getCanonicalName() + " - "
						+ ex.getMessage();
				log.error(msg, ex);
				throw new LeapException(msg, ex);
			}
		}
		data = String.format("%s%s%s", "{\"input_string\":", data, "}");

		try {
			data = pipelineService.populateDatasetDetails(data, jobDetails.getOrg());
		} catch (Exception ex) {
			String msg = "Error in populating dataset : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
		}

		try {
			data = pipelineService.populateSchemaDetails(data, jobDetails.getOrg());
		} catch (Exception ex) {
			String msg = "Error in populating schema : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
		}

		if (params != null && !params.isEmpty() && !params.equals("{}")) {
			try {
				data = pipelineService.populateAttributeDetails(data, params);
			} catch (Exception ex) {
				String msg = "Error in populating attributes : " + ex.getClass().getCanonicalName() + " - "
						+ ex.getMessage();
				log.error(msg, ex);
				throw new LeapException(msg, ex);
			}
		}

		data = resolver.resolveDatasetData(data, org);

		if (jobDetails.isRestNode()) {
			writeTempFile(createDragNDropYamlscript(data, org, cname, correlationJson, jobDetails),
					jobDetails.getYamltempFile());
			cmdStr = resolveCommand(dragAndDropCommandWithRestNode, new String[] {});
		} else {
			writeTempFile(createDragNDropYamlscript(data, org, cname, jobDetails), jobDetails.getYamltempFile());
			cmdStr = resolveCommand(dragAndDropCommand, new String[] {});
		}
		return cmdStr;
	}

	/**
	 * Creates the drag N drop yamlscript.
	 *
	 * @param elementsData the elements data
	 * @param org          the org
	 * @param pipelineName the pipeline name
	 * @param jobDetails   the job details
	 * @return the string builder
	 * @throws LeapException the leap exception
	 */
	private StringBuilder createDragNDropYamlscript(Object elementsData, String org, String pipelineName,
			ICIPNativeJobDetails jobDetails) throws LeapException {
		try {
			log.info("creating draganddrop yaml script");
			Yaml yaml = new Yaml();
			Map<String, Object> root = new HashMap<>();
			Map<String, Object> buildDAG = new HashMap<>();
			Map<String, Object> inputs = new HashMap<>();
			Map<String, Object> pipelineJson = new HashMap<>();
			Map<String, Object> value = new HashMap<>();

			buildDAG.put(IAIJobConstants.BUILDDAG, inputs);
			inputs.put(IAIJobConstants.INPUTS, pipelineJson);
			pipelineJson.put(IAIJobConstants.PIPELINEJSON, value);
			JsonObject elementDJson = new Gson().fromJson(elementsData.toString(), JsonElement.class).getAsJsonObject();
			JsonObject element = elementDJson.get("input_string").getAsJsonObject();
			element.addProperty(JobConstants.ORG, org);
			addTriggerTime(element, jobDetails.getTriggerValues());
			element.addProperty(IAIJobConstants.PIPELINENAME, pipelineName);
			value.put(IAIJobConstants.VALUE, element.toString());
			root.put(IAIJobConstants.SOLIDS, buildDAG);
			root.put(IAIJobConstants.LOGGERS, getLoggersValue());

			return new StringBuilder().append(yaml.dump(root));
		} catch (Exception ex) {
			String msg = "Error in creating yaml file : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
		}
	}

	/**
	 * Creates the drag N drop yamlscript.
	 *
	 * @param elementsData the elements data
	 * @param org          the org
	 * @param pipelineName the pipeline name
	 * @param restNodeJson the rest node json
	 * @param jobDetails   the job details
	 * @return the string builder
	 * @throws LeapException the leap exception
	 */
	private StringBuilder createDragNDropYamlscript(Object elementsData, String org, String pipelineName,
			JsonObject restNodeJson, ICIPNativeJobDetails jobDetails) throws LeapException {
		try {
			log.info("creating draganddrop yaml script");
			Yaml yaml = new Yaml();
			Map<String, Object> root = new HashMap<>();
			Map<String, Object> buildDAG = new HashMap<>();
			Map<String, Object> inputs = new HashMap<>();
			Map<String, Object> pipelineJson = new HashMap<>();
			Map<String, Object> value = new HashMap<>();

			buildDAG.put(IAIJobConstants.BUILDDAG, inputs);
			inputs.put(IAIJobConstants.INPUTS, pipelineJson);
			pipelineJson.put(IAIJobConstants.PIPELINEJSON, value);
			JsonObject elementDJson = new Gson().fromJson(elementsData.toString(), JsonElement.class).getAsJsonObject();
			JsonObject element = elementDJson.get("input_string").getAsJsonObject();
			element.addProperty(JobConstants.ORG, org);
			element.addProperty(IAIJobConstants.PIPELINENAME, pipelineName);
			element.addProperty(JobConstants.RESTNODEID, restNodeJson.get(JobConstants.RESTNODEID).getAsString());
			element.addProperty(IAIJobConstants.RESTNODEFILE,
					restNodeJson.get(IAIJobConstants.RESTNODEFILE).getAsString());
			addTriggerTime(element, jobDetails.getTriggerValues());
			value.put(IAIJobConstants.VALUE, element.toString());
			root.put(IAIJobConstants.SOLIDS, buildDAG);
			root.put(IAIJobConstants.LOGGERS, getLoggersValue());

			return new StringBuilder().append(yaml.dump(root));
		} catch (Exception ex) {
			String msg = "Error in creating yaml file : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
		}
	}

	/**
	 * Creates the correlation file.
	 *
	 * @param params    the params
	 * @param id        the id
	 * @param directory the directory
	 * @return the json object
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private JsonObject createCorrelationFile(String params, String id, String directory) throws IOException {
		String alteredId = ICIPUtils.removeSpecialCharacter(id);
		Path path = Paths.get(annotationServiceUtil.getFolderPath(), directory,
				alteredId + IAIJobConstants.CORRELATIONEXTENSION);
		log.info("uploading file at {}", path.toAbsolutePath());
		Files.createDirectories(path.getParent());
		byte[] strToBytes = params.getBytes();
		Files.write(path, strToBytes);
		JsonObject jsonObject = new JsonObject();
		jsonObject.addProperty(JobConstants.RESTNODEID, id);
		jsonObject.addProperty(IAIJobConstants.RESTNODEFILE, path.toAbsolutePath().toString());
		return jsonObject;
	}

	@Override
	public Path getFilePath(ICIPNativeJobDetails jobDetails) {
		// TODO Auto-generated method stub
		
			Path path = Paths.get(pipelineScriptPath, jobDetails.getCname(), jobDetails.getCname() + "_generatedCode.py");
			return path;
		
	}

}

