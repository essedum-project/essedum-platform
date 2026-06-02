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

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.icipwebeditor.IICIPJobServiceUtil;
import com.lfn.icip.icipwebeditor.constants.FileConstants;
import com.lfn.icip.icipwebeditor.file.service.ICIPFileService;
import com.lfn.icip.icipwebeditor.model.dto.ICIPNativeJobDetails;
import com.lfn.icip.icipwebeditor.service.impl.ICIPPipelineService;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
//
/**
 * The Class ICIPJobServiceUtilBinary.
 *
 * @author essedum
 */

@Component("binaryjob")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope

/** The Constant log. */
@Log4j2
public class ICIPJobServiceUtilBinary extends ICIPCommonJobServiceUtil implements IICIPJobServiceUtil {

	/**
	 * Instantiates a new ICIP job service util binary.
	 */
	public ICIPJobServiceUtilBinary() {
		super();
	}

	/** The pipeline service. */
	@Autowired
	private ICIPPipelineService pipelineService;

	/** The i CIP file service. */
	@Autowired
	private ICIPFileService iCIPFileService;

	/** The binary command. */
	@EssedumProperty("icip.pipeline.binary.command")
	private String binaryCommand;

	/**
	 * Gets the command.
	 *
	 * @param jobDetails the job details
	 * @return the command
	 * @throws EssedumException the essedum exception
	 */
	@Override
	public String getCommand(ICIPNativeJobDetails jobDetails) throws EssedumException {
		String cname = jobDetails.getCname();
		String org = jobDetails.getOrg();
		String cmdStr;
		log.info("running binary pipeline");
		String data = pipelineService.getJson(cname, org);

		JsonObject binary = null;
		try {
			binary = gson.fromJson(data, JsonElement.class).getAsJsonObject().get("elements").getAsJsonArray().get(0)
					.getAsJsonObject().get("attributes").getAsJsonObject();
		} catch (Exception ex) {
			String msg = "Error in fetching elements[0].attributes : " + ex.getClass().getCanonicalName() + " - "
					+ ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		String tmpfileType = null;
		try {
			tmpfileType = binary.get("filetype").getAsString().toLowerCase();
		} catch (Exception ex) {
			String msg = "Error in getting filetype : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		String fileType = "";
		StringBuilder paths2 = new StringBuilder();

		JsonArray files2 = null;
		try {
			files2 = binary.get("files2").getAsJsonArray();
		} catch (Exception ex) {
			String msg = "Error in getting file array : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		for (JsonElement file : files2) {
			String filePathString = file.getAsString();
			Path path;
			InputStream fis = null;
			try {
				fis = iCIPFileService.getBinaryInputStream(cname, org, filePathString);
				path = iCIPFileService.getFileInServer(fis,
						filePathString, FileConstants.BINARY);
			} catch (IOException | SQLException ex) {
				String msg = "Error in getting file path : " + ex.getClass().getCanonicalName() + " - "
						+ ex.getMessage();
				log.error(msg, ex);
				throw new EssedumException(msg, ex);
			}
			finally {
				if(fis != null)
				{
				try {
					 fis.close();
					 } catch (Exception ex) {
						 log.error(ex.getMessage(), ex);
					 }
				}
			}
			paths2.append(path.toAbsolutePath());
			paths2.append(",");
		}
		if (paths2.length() > 0) {
			paths2.replace(paths2.length() - 1, paths2.length(), "");
			switch (tmpfileType) {
			case "jar":
				fileType = " --jars ";
				break;
			case "python":
				fileType = " --py-files ";
				break;
			default:
				log.error("Invalid format");
			}
		}

		StringBuilder paths = new StringBuilder();

		JsonArray files;
		try {
			files = binary.get("files").getAsJsonArray();
		} catch (Exception ex) {
			String msg = "Error in getting file array : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		for (JsonElement file : files) {
			String filePathString = file.getAsString();
			Path path;
			InputStream is = null;
			try {
				is=iCIPFileService.getBinaryInputStream(cname, org, filePathString);
				path = iCIPFileService.getFileInServer(is,
						filePathString, FileConstants.BINARY);
			} catch (IOException | SQLException ex) {
				String msg = "Error in getting file path : " + ex.getClass().getCanonicalName() + " - "
						+ ex.getMessage();
				log.error(msg, ex);
				throw new EssedumException(msg, ex);
			}
			finally {
				if(is != null)
				{
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

		String classString;
		try {
			classString = binary.get("className").getAsString();
		} catch (Exception ex) {
			String msg = "Error in getting class name : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		String arguments;
		try {
			arguments = binary.get("arguments").getAsString();
		} catch (Exception ex) {
			String msg = "Error in getting arguments : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			throw new EssedumException(msg, ex);
		}

		cmdStr = resolveCommand(binaryCommand,
				new String[] { classString, fileType, paths2.toString(), paths.toString(), arguments });
		return cmdStr;
	}

	@Override
	public Path getFilePath(ICIPNativeJobDetails jobDetails) {
		String cname = jobDetails.getCname();
		String org = jobDetails.getOrg();
		String cmdStr;
		log.info("running binary pipeline");
		String data = pipelineService.getJson(cname, org);

		JsonObject binary = null;
		try {
			binary = gson.fromJson(data, JsonElement.class).getAsJsonObject().get("elements").getAsJsonArray().get(0)
					.getAsJsonObject().get("attributes").getAsJsonObject();
		} catch (Exception ex) {
			String msg = "Error in fetching elements[0].attributes : " + ex.getClass().getCanonicalName() + " - "
					+ ex.getMessage();
			log.error(msg, ex);
			
		}
		
		JsonArray files2 = null;
		try {
			files2 = binary.get("files2").getAsJsonArray();
		} catch (Exception ex) {
			String msg = "Error in getting file array : " + ex.getClass().getCanonicalName() + " - " + ex.getMessage();
			log.error(msg, ex);
			
		}
		for (JsonElement file : files2) {
			String filePathString = file.getAsString();
			Path path=null;
			InputStream fis = null;
			try {
				fis = iCIPFileService.getBinaryInputStream(cname, org, filePathString);
				path = iCIPFileService.getFileInServer(fis,
						filePathString, FileConstants.BINARY);
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
