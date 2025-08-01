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

package com.infosys.icets.icip.icipwebeditor.job.jobs;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.icip.dataset.model.ICIPSchemaRegistry;
import com.infosys.icets.icip.dataset.repository.ICIPSchemaRegistryRepository;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobMetadata;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.infosys.icets.icip.icipwebeditor.job.util.InternalJob;
/*import com.infosys.icets.icip.icipwebeditor.job.util.InternalJob;*/
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPGroups;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPBinaryFilesDTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPNativeScriptDTO;
import com.infosys.icets.icip.icipwebeditor.service.IICIPNativeScriptService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPBinaryFilesService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPGroupModelService;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPGroupsService;
import com.jayway.jsonpath.JsonPath;

import ch.qos.logback.classic.LoggerContext;
import lombok.Setter;


// 
/**
 * The Class ICIPCopyBluePrintJob.
 *
 * @author icets
 */

/**
 * Sets the claim.
 *
 * @param claim the new claim
 */
@Setter
public class ICIPImportPipelines implements InternalJob {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	/** The Constant INTERNALJOBNAME. */
	private static final String INTERNALJOBNAME = "ImportPipelines";

	/** The jobs service. */
	@Autowired
	private ICIPInternalJobsService jobsService;

	/** The logging path. */
	@Value("${LOG_PATH}")
	private String loggingPath;

	/** The streaming services service. */
	@Autowired
	private IICIPStreamingServiceService streamingServicesService;

	/** The native script service. */
	@Autowired
	private IICIPNativeScriptService nativeScriptService;

	/** The binary files service. */
	@Autowired
	private ICIPBinaryFilesService binaryFilesService;

	/** The schema registry repository. */
	@Autowired
	private ICIPSchemaRegistryRepository schemaRegistryRepository;

	/** The group model service. */
	@Autowired
	private ICIPGroupModelService groupModelService;

	/** The group service. */
	@Autowired
	private ICIPGroupsService groupService;

	/** Claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/**
	 * Copy CopyDatasets.
	 *
	 * @param marker          the marker
	 * @param org the org
	 * @param data the data
	 * @param submittedBy the submitted by
	 * @return the boolean
	 */
	public Boolean importPipeline(Marker marker, String org, String data, String submittedBy) {
		logger.info(marker, "Executing import to {}", org);
		Gson g = new Gson();
		ICIPGroups grp = groupService.getGroup("Copied Entities", org);
		if (grp == null) {
			ICIPGroups group = new ICIPGroups();
			group.setDescription("Copied entities");
			group.setAlias("Copied Entities");
			group.setName("Copied Entities");
			group.setOrganization(org);
			grp = groupService.save(group);
		}
		ICIPGroups group = grp;
		JsonObject obj = g.fromJson(data, JsonObject.class);
		JsonArray pipelines = g.fromJson(obj.get("pipelines").getAsString(), JsonArray.class);
		JsonArray nativeFiles = g.fromJson(obj.get("nativeFile").getAsString(), JsonArray.class);
		JsonArray binaryFiles = g.fromJson(obj.get("binaryFile").getAsString(), JsonArray.class);
		pipelines.forEach(x -> {
			ICIPStreamingServices pipeline = g.fromJson(x, ICIPStreamingServices.class);
			pipeline.setOrganization(org);
			pipeline.setCid(null);
			pipeline.setCreatedBy(submittedBy);
			pipeline.setCreatedDate(new Timestamp(System.currentTimeMillis()));
			pipeline.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
			pipeline.setLastmodifiedby(submittedBy);
			if(pipeline.getInterfacetype() == null)
				pipeline.setInterfacetype("pipeline");
			try {
			pipeline = streamingServicesService.save(pipeline);
				logger.info(marker, "Pipeline {} saved in {}", pipeline.getAlias(),org);
			}catch(DataIntegrityViolationException de) {
				logger.info(marker, "Pipeline {} already present in {}", pipeline.getAlias(),org);
			}
			groupModelService.save("pipeline", pipeline.getName(), group);
			if (pipeline.getJsonContent() != null) {
				List<Object> schemas = JsonPath.read(pipeline.getJsonContent(), "$..schema");
				schemas.forEach(schema -> {
					if (schema != null && schema instanceof Map) {
						JsonObject tmpElement = g.toJsonTree(schema, LinkedHashMap.class).getAsJsonObject();
						if (schemaRegistryRepository.findByNameAndOrganization(tmpElement.get("name").getAsString(),
								org) != null) {
							ICIPSchemaRegistry sch = new ICIPSchemaRegistry();
							sch.setAlias(tmpElement.get("alias").getAsString());
							sch.setName(tmpElement.get("name").getAsString());
//							sch.setFormtemplate(tmpElement.get("formtemplate").toString());
							sch.setLastmodifieddate(new Timestamp(System.currentTimeMillis()));
							sch.setLastmodifiedby(submittedBy);
							sch.setSchemavalue(tmpElement.get("schemavalue").toString());
							sch.setId(null);
							sch.setOrganization(org);
							sch = schemaRegistryRepository.save(sch);
							groupModelService.save("schema", sch.getName(), group);
						}
					}
				});
			}
		});
		nativeFiles.forEach(x -> {
			ICIPNativeScriptDTO nativescript = g.fromJson(x, ICIPNativeScriptDTO.class);
			if (nativescript != null) {
				try {
					nativescript.setId(null);
					nativescript.setOrganization(org);
//					nativescript.setFilescript(nativescript.getFilescript().replace("\n/g", "\r\n"));
					nativeScriptService.save(nativescript.toEntity());
					logger.info(marker, "Native file saved in {}",org);
				} catch (SQLException e) {
					logger.error("Error in saving native script", e.getMessage(), e);
				}
			}
		});
		binaryFiles.forEach(x -> {
			ICIPBinaryFilesDTO binary = g.fromJson(x, ICIPBinaryFilesDTO.class);
			if (binary != null) {
				binary.setId(null);
				binary.setOrganization(org);
				try {
					binaryFilesService.save(binary.toEntity());
					logger.info(marker, "Binary File Saved");
				} catch (SQLException e) {
					logger.error("Error in saving binary script", e.getMessage(), e);
				}
			}

		});
		return true;
	}

	/**
	 * Execute.
	 *
	 * @param context the context
	 * @throws JobExecutionException the job execution exception
	 */
	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		Marker marker = null;
		ICIPInternalJobs internalJob = null;
		String data;
		try {
			String uid = ICIPUtils.removeSpecialCharacter(UUID.randomUUID().toString());
			marker = MarkerFactory.getMarker(uid);
			JobDataMap dataMap = context.getJobDetail().getJobDataMap();
			String submittedBy = dataMap.getString("submittedBy");
			String org = dataMap.getString("org");
			if(dataMap.getString("filepath")!=null) {
				String filePath = dataMap.getString("filepath");
				Path path = Paths.get(filePath);
				try (FileInputStream fileIn = new FileInputStream(path.toFile())) {
					data = new String(fileIn.readAllBytes());
				}
			}
			else {
				data=new String(dataMap.get("jsondata").toString());
			}
			Timestamp submittedOn = new Timestamp(new Date().getTime());
			internalJob = jobsService.createInternalJobs(INTERNALJOBNAME, uid, submittedBy, submittedOn, org);
			ICIPInternalJobs.MetaData metadata = new ICIPInternalJobs.MetaData();
			metadata.setTag(JobMetadata.USER.toString());
			internalJob = internalJob.updateMetadata(metadata);
			internalJob = jobsService.save(internalJob);

			LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
			loggerContext.putProperty("marker", String.valueOf(internalJob.getId()));
			importPipeline(marker, org, data, submittedBy);
			logger.info(marker, "Pipeline imported successfully in {}", org);
			jobsService.updateInternalJob(internalJob, JobStatus.COMPLETED.toString());
		} catch (Exception ex) {
			logger.error(marker, ex.getMessage(), ex);
			try {
				jobsService.updateInternalJob(internalJob, JobStatus.ERROR.toString());
			} catch (IOException e) {
				logger.error(marker, e.getMessage());
			}
		}
	}

	 @Override 
	public String getName() {
		// TODO Auto-generated method stub
		return INTERNALJOBNAME;
	}

	 @Override 
	public String getUrl() {
		// TODO Auto-generated method stub
		return "/importpipelines";
	}

	 @Override 
	public String getDescription() {
		// TODO Auto-generated method stub
		return "Job to import all type of pipelines";
	}

	/*
	 * @Override public String getName() { // TODO Auto-generated method stub return
	 * INTERNALJOBNAME; }
	 * 
	 * @Override public String getUrl() { // TODO Auto-generated method stub return
	 * "/importpipelines"; }
	 * 
	 * @Override public String getDescription() { // TODO Auto-generated method stub
	 * return "Job to import all type of pipelines"; }
	 */

}
