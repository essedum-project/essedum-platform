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
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.text.StringEscapeUtils;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;
import com.infosys.icets.icip.dataset.model.ICIPSchemaDetails;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.impl.ICIPSchemaRegistryService;
import com.infosys.icets.icip.icipwebeditor.IICIPJobServiceUtil;
import com.infosys.icets.icip.icipwebeditor.constants.FileConstants;
import com.infosys.icets.icip.icipwebeditor.constants.IAIJobConstants;
import com.infosys.icets.icip.icipwebeditor.constants.LoggerConstants;
import com.infosys.icets.icip.icipwebeditor.file.service.ICIPFileService;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPNativeJobDetails;
import com.infosys.icets.icip.icipwebeditor.service.aspect.IAIResolverAspect;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPPipelineService;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
//
/**
 * The Class ICIPJobServiceUtilNativeScript.
 *
 * @author icets
 */

@Component("nativescriptjob")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope

/** The Constant log. */
@Log4j2
public class ICIPJobServiceUtilNativeScript extends ICIPCommonJobServiceUtil implements IICIPJobServiceUtil {

	/**
	 * Instantiates a new ICIP job service util native script.
	 */
	public ICIPJobServiceUtilNativeScript() {
		super();
	}

	/** The pipeline service. */
	@Autowired
	private ICIPPipelineService pipelineService;

	/** The datasource service. */
	@Autowired
	private ICIPDatasourceService datasourceService;

	/** The dataset service. */
	@Autowired
	private ICIPDatasetService datasetService;

	/** The schema registry service. */
	@Autowired
	private ICIPSchemaRegistryService schemaRegistryService;

	/** The i CIP file service. */
	@Autowired
	private ICIPFileService iCIPFileService;

	/** The resolver. */
	@Autowired
	private IAIResolverAspect resolver;

	/** The nativescript python command. */
	@LeapProperty("icip.pipeline.nativescript.python.command")
	private String nativescriptPythonCommand;

	/** The nativescript python 2 command. */
	@LeapProperty("icip.pipeline.nativescript.python2.command")
	private String nativescriptPython2Command;

	/** The nativescript javascript command. */
	@LeapProperty("icip.pipeline.nativescript.javascript.command")
	private String nativescriptJavascriptCommand;

	/** The nativescript python V 2 command. */
	@LeapProperty("icip.pipeline.nativescript.v2.python.command")
	private String nativescriptPythonV2Command;

	/** The nativescript python 2 V 2 command. */
	@LeapProperty("icip.pipeline.nativescript.v2.python2.command")
	private String nativescriptPython2V2Command;

	/** The nativescript javascript V 2 command. */
	@LeapProperty("icip.pipeline.nativescript.v2.javascript.command")
	private String nativescriptJavascriptV2Command;

	/** The Constant INVALID_TYPE. */
	private static final String INVALID_TYPE = "Invalid Type";

	/**
	 * Gets the command.
	 *
	 * @param jobDetails the job details
	 * @return the command
	 * @throws LeapException the leap exception
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	@Override
	public String getCommand(ICIPNativeJobDetails jobDetails) throws LeapException, InvalidRemoteException, TransportException, GitAPIException {
		String cname = jobDetails.getCname();
		String org = jobDetails.getOrg();
		String params = jobDetails.getParams();
		String cmdStr = null;
		log.info("running native script");
		String data = pipelineService.getJson(cname, org);

		JsonObject attrObject;
		try {
			attrObject = gson.fromJson(data, JsonElement.class).getAsJsonObject().get("elements").getAsJsonArray()
					.get(0).getAsJsonObject().get("attributes").getAsJsonObject();
		} catch (Exception ex) {
			String msg = "Error in fetching elements[0].attributes : " + ex.getClass().getCanonicalName() + " - "
					+ ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
		}

		String tmpfileType;
		try {
			tmpfileType = attrObject.get("filetype").getAsString().toLowerCase().trim();
		} catch (Exception ex) {
			String msg = "Error in getting filetype : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
		}

		String[] separator = new String[] { "" };
		switch (tmpfileType) {
		case IAIJobConstants.PYTHON2:
		case IAIJobConstants.PYTHON3:
		case IAIJobConstants.JYTHON_LANG:
			separator[0] = ":";
			break;
		case "javascript":
			separator[0] = "=";
			break;
		default:
			log.error(INVALID_TYPE);
		}
		StringBuilder paths = new StringBuilder();

		JsonArray files;
		try {
			files = attrObject.get("files").getAsJsonArray();
		} catch (Exception ex) {
			String msg = "Error in getting file array : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
		}

		for (JsonElement file : files) {
			String filePathString = file.getAsString();
			Path path;
			InputStream is = null;
			try {
				is = iCIPFileService.getNativeCodeInputStream(cname, org, filePathString);
				path = iCIPFileService.getFileInServer(is, filePathString, FileConstants.NATIVE_CODE);
			} catch (IOException | SQLException ex) {
				String msg = "Error in getting file path : " + ex.getClass().getCanonicalName() + " - "
						+ ex.getMessage();
				log.error(msg, ex);
				throw new LeapException(msg, ex);
			} finally {
				if (is != null) {
					try {
						is.close();
					} catch (IOException ex) {
						log.error(ex.getMessage(), ex);
					}
				}
			}
			paths.append(path.toAbsolutePath());
			paths.append(",");
		}
		if (paths.length() > 0)
			paths.replace(paths.length() - 1, paths.length(), "");

		Map<String, String> argumentBuilder = new HashMap<>();
		JsonArray argumentArray = getLatestArgument(attrObject, params, gson);
		for (JsonElement argument : argumentArray) {
			JsonObject element = argument.getAsJsonObject();
			String key = element.get("name").toString();
			JsonElement tmpValue = element.get("value");
			String value = tmpValue.toString();
			if (element.has("type") && !element.get("type").getAsString().equals("Text")) {
				value = tmpValue.getAsString();
				switch (element.get("type").getAsString()) {
				case "Datasource":
					ICIPDatasource datasource = datasourceService.getDatasource(value, org);
					JsonObject connDetails;
					try {
						connDetails = gson.fromJson(datasource.getConnectionDetails(), JsonElement.class)
								.getAsJsonObject();
					} catch (Exception ex) {
						String msg = "Error in getting datasource : " + ex.getClass().getCanonicalName() + " - "
								+ ex.getMessage();
						log.error(msg, ex);
						throw new LeapException(msg, ex);
					}
					connDetails.addProperty("salt", datasource.getSalt());
					value = String.format(LoggerConstants.STRING_STRING_STRING, "\"",
							StringEscapeUtils.escapeJson(gson.toJson(connDetails)), "\"");
					break;
				case "Dataset":
					JsonParser parser = new JsonParser();
					ICIPDataset dataset = datasetService.getDataset(value, org);
					JsonElement e;
					try {
						e = parser.parse(gson.toJson(dataset));
					} catch (Exception ex) {
						String msg = "Error in getting dataset : " + ex.getClass().getCanonicalName() + " - "
								+ ex.getMessage();
						log.error(msg, ex);
						throw new LeapException(msg, ex);
					}
					for (Entry<String, JsonElement> schemaentry : e.getAsJsonObject().entrySet()) {
						if (schemaentry.getKey().equals(IAIJobConstants.SCHEMA)) {
							JsonObject obj = schemaentry.getValue().getAsJsonObject();
							ICIPSchemaDetails schemaDetails = new ICIPSchemaDetails();
							try {
								String schemaValue = obj.get("schemavalue").getAsString();
								JsonElement schemaElem = parser.parse(schemaValue);
								schemaDetails.setSchemaDetails(schemaElem.getAsJsonArray());
								schemaDetails.setSchemaId(obj.get("name").getAsString());
								e.getAsJsonObject().remove(IAIJobConstants.SCHEMA);
								e.getAsJsonObject().add(IAIJobConstants.SCHEMA,
										parser.parse(gson.toJson(schemaDetails)));
							} catch (Exception ex) {
								String msg = "Error in getting schema from dataset : "
										+ ex.getClass().getCanonicalName() + " - " + ex.getMessage();
								log.error(msg, ex);
								throw new LeapException(msg, ex);
							}
							break;
						}
					}
					value = String.format(LoggerConstants.STRING_STRING_STRING, "\"",
							StringEscapeUtils.escapeJson(gson.toJson(e)), "\"");
					break;
				case "Schema":
					try {
						value = String.format(LoggerConstants.STRING_STRING_STRING, "\"",
								StringEscapeUtils.escapeJson(schemaRegistryService.fetchSchemaValue(value, org)), "\"");
					} catch (Exception ex) {
						String msg = "Error in getting schema : " + ex.getClass().getCanonicalName() + " - "
								+ ex.getMessage();
						log.error(msg, ex);
						throw new LeapException(msg, ex);
					}
					break;
				default:
					log.error(INVALID_TYPE);
				}
			}
			argumentBuilder.put(key, resolver.resolveDatasetData(value, org));
		}
		addTriggerTime(argumentBuilder, jobDetails.getTriggerValues());
		String arguments = "";
		String version = attrObject.has("version") ? attrObject.get("version").getAsString().trim() : "";
		if (version.equalsIgnoreCase("v2")) {
			try {
				Path tmpPath = Files.createTempDirectory("nativescript");
				Path filePath = Paths.get(tmpPath.toAbsolutePath().toString(),
						String.format("%s.yaml", ICIPUtils.removeSpecialCharacter(jobDetails.getCname())));
				Files.createDirectories(filePath.getParent());
				Files.deleteIfExists(filePath);
				Files.createFile(filePath);
				writeTempFile(createNativeYamlscript(argumentBuilder), filePath);
				arguments = filePath.toAbsolutePath().toString();
			} catch (Exception ex) {
				throw new LeapException(ex.getMessage(), ex);
			}
		} else {
			StringBuilder args = new StringBuilder();
			argumentBuilder.forEach((key, value) -> args.append(" ").append(key).append(separator[0]).append(value));
			arguments = args.toString();
		}
		switch (tmpfileType) {
		case IAIJobConstants.PYTHON2:
			cmdStr = resolveCommand(
					version.equalsIgnoreCase("v2") ? nativescriptPython2V2Command : nativescriptPython2Command,
					new String[] { paths.toString(), arguments });
			break;
		case IAIJobConstants.PYTHON3:
		case IAIJobConstants.JYTHON_LANG:
			cmdStr = resolveCommand(
					version.equalsIgnoreCase("v2") ? nativescriptPythonV2Command : nativescriptPythonCommand,
					new String[] { paths.toString(), arguments });
			break;
		case "javascript":
			cmdStr = resolveCommand(
					version.equalsIgnoreCase("v2") ? nativescriptJavascriptV2Command : nativescriptJavascriptCommand,
					new String[] { paths.toString(), arguments });
			break;
		default:
			log.error(INVALID_TYPE);
		}
		return cmdStr;
	}

	/**
	 * Gets the latest argument.
	 *
	 * @param binary the binary
	 * @param params the params
	 * @param gson   the gson
	 * @return the latest argument
	 * @throws LeapException the leap exception
	 */
	private JsonArray getLatestArgument(JsonObject binary, String params, Gson gson) throws LeapException {
		try {
			JsonArray binaryArray = binary.get("arguments").getAsJsonArray();
			if (!(params == null || params.trim().isEmpty() || params.trim().equals("{}"))) {
				JsonObject paramsObject = gson.fromJson(params, JsonElement.class).getAsJsonObject();
				for (JsonElement binaryElement : binaryArray) {
					JsonObject binaryObject = binaryElement.getAsJsonObject();
					Set<String> paramsKeySet = paramsObject.keySet();
					String key = null;
					try {
						key = binaryObject.get("name").getAsString();
					} catch (Exception ex) {
						log.error("getAsString() method error!");
						key = binaryObject.get("name").toString();
					}
					if (paramsKeySet.contains(key)) {
						String value = null;
						try {
							value = paramsObject.get(key).getAsString();
						} catch (Exception ex) {
							log.error("getAsString() method error!");
							value = paramsObject.get(key).toString();
						}
						binaryObject.addProperty("value", value);
					}
				}
			}
			return binaryArray;
		} catch (Exception ex) {
			String msg = "Error in getting arguments : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
		}
	}

	/**
	 * Creates the native yamlscript.
	 *
	 * @param data the data
	 * @return the string builder
	 * @throws LeapException the leap exception
	 */
	private StringBuilder createNativeYamlscript(Map<String, String> data) throws LeapException {
		try {
			log.info("creating native yaml script");
			Yaml yaml = new Yaml();
			return new StringBuilder().append(yaml.dumpAsMap(data));
		} catch (Exception ex) {
			String msg = "Error in creating yaml file : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new LeapException(msg, ex);
		}
	}

	@Override
	public Path getFilePath(ICIPNativeJobDetails jobDetails) throws InvalidRemoteException, TransportException, GitAPIException {
		String cname = jobDetails.getCname();
		String org = jobDetails.getOrg();
		String data = pipelineService.getJson(cname, org);

		JsonObject attrObject = null;
		try {
			attrObject = gson.fromJson(data, JsonElement.class).getAsJsonObject().get("elements").getAsJsonArray()
					.get(0).getAsJsonObject().get("attributes").getAsJsonObject();
		} catch (Exception ex) {
			String msg = "Error in fetching elements[0].attributes : " + ex.getClass().getCanonicalName() + " - "
					+ ex.getMessage();
			log.error(msg, ex);
 
		}
		StringBuilder paths = new StringBuilder();

		JsonArray files = null;
		try {
			files = attrObject.get("files").getAsJsonArray();
		} catch (Exception ex) {
			String msg = "Error in getting file array : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);

		}

		for (JsonElement file : files) {
			String filePathString = file.getAsString();
			Path path = null;
			InputStream is = null;
			try {
				is = iCIPFileService.getNativeCodeInputStream(cname, org, filePathString);
				path = iCIPFileService.getFileInServer(is, filePathString, FileConstants.NATIVE_CODE);
			} catch (IOException | SQLException ex) {
				String msg = "Error in getting file path : " + ex.getClass().getCanonicalName() + " - "
						+ ex.getMessage();
				log.error(msg, ex);

			}
			return path;
		}
		return null;
	}
}
