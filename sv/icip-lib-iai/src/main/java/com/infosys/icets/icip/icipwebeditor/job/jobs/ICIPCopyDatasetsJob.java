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

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.persistence.EntityNotFoundException;

import org.apache.http.NameValuePair;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.ssl.TrustStrategy;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.RestClientUtil;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
//import com.infosys.icets.iamp.ied.service.CopyBlueprintService;
//import com.infosys.icets.iamp.ied.web.rest.CopyBlueprintResource;
//import com.infosys.icets.iamp.usm.domain.Project;
//import com.infosys.icets.iamp.usm.service.ProjectService;
import com.infosys.icets.icip.dataset.service.impl.ICIPAdpService;
import com.infosys.icets.icip.icipwebeditor.event.model.InternalEvent;
import com.infosys.icets.icip.icipwebeditor.event.publisher.InternalEventPublisher;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobMetadata;
import com.infosys.icets.icip.icipwebeditor.job.enums.JobStatus;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.infosys.icets.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;
import com.infosys.icets.icip.icipwebeditor.rest.ICIPJobsController;
import com.infosys.icets.icip.icipwebeditor.service.impl.ICIPIaiService;
import com.nimbusds.jose.proc.BadJOSEException;

import ch.qos.logback.classic.LoggerContext;
import lombok.Setter;

import org.springframework.transaction.UnexpectedRollbackException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;


// 
/**
 * The Class ICIPCopyBluePrintJob.
 *
 * @author icets
 */
@Setter
public class ICIPCopyDatasetsJob implements Job {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(JobLogger.class);

	private static final String INTERNALJOBNAME = "CopyDatasets";

	private static final String FROM_PROJECT = "fromProject";
	private static final String TO_PROJECT = "toProject";
	private static final String PROJECT_ID = "projectId";
	private static final String SUBMITTED_BY = "submittedBy";
	private static final String ORG = "org";
	
	@Value("${security.claim:#{null}}")
	private String claim;

	/** The i CIP adp service. */
	@Autowired
	private ICIPAdpService iCIPAdpService;

	/** The jobs service. */
	@Autowired
	private ICIPInternalJobsService jobsService;
	
	@Autowired
	private InternalEventPublisher eventService;

	@Autowired
	private ICIPJobsController apiCaller;
	
    @Autowired
	private RestTemplate restTemplate;
    
	@Value("${LEAP_ULR}")
	private String leapUrl;

	/** The logging path. */
	@Value("${LOG_PATH}")
	private String loggingPath;

	/** The access token. */
	@Value("${config.service-auth.access-token}")
	private String accessToken;

	/**
	 * Copy blueprints.
	 *
	 * @param marker          the marker
	 * @param fromProjectName the from project name
	 * @param toProjectName   the to project name
	 * @return the boolean
	 */
	public Boolean copyDatasets(Marker marker, String fromProjectName, String toProjectName, int datasetProjectId, ICIPInternalJobs internalJob) {
		logger.info(marker, "Executing copy datasets for {} to {}", fromProjectName, toProjectName);
		try{
			iCIPAdpService.copyBlueprints(marker, fromProjectName, toProjectName, datasetProjectId);		
			return true;
		}
		catch(Exception ex) {
			logger.error(marker, ex.getMessage(), ex);
			try {
				if(internalJob.getJobStatus() != "CANCELLED")
					jobsService.updateInternalJob(internalJob, JobStatus.ERROR.toString());
				return false;
			} catch (IOException e) {
				logger.error(marker, e.getMessage(), e);
				return false;
			}
		}
		
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
		try {
			String uid = ICIPUtils.removeSpecialCharacter(UUID.randomUUID().toString());
			marker = MarkerFactory.getMarker(uid);
			JobDataMap dataMap = context.getJobDetail().getJobDataMap();
			String fromProjectName = dataMap.getString("fromProject");
			String toProjectName = dataMap.getString("toProject");
			int datasetProjectId = Integer.parseInt(dataMap.getString("projectId"));
			String submittedBy = dataMap.getString("submittedBy");
			String org = dataMap.getString("org");
			Timestamp submittedOn = new Timestamp(new Date().getTime());
			internalJob = jobsService.createInternalJobs(INTERNALJOBNAME, uid, submittedBy, submittedOn, org);

			ICIPInternalJobs.MetaData metadata = new ICIPInternalJobs.MetaData();
			metadata.setTag(JobMetadata.USER.toString());
			internalJob = internalJob.updateMetadata(metadata);
			internalJob = jobsService.save(internalJob);

			LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
			loggerContext.putProperty("marker", String.valueOf(internalJob.getId()));
			
			Boolean status = copyDatasets(marker, fromProjectName, toProjectName, datasetProjectId, internalJob);
			if(status) {
				jobsService.updateInternalJob(internalJob, JobStatus.COMPLETED.toString());
				apiCaller.runCopyPipelines(toProjectName, fromProjectName,String.valueOf(datasetProjectId), org);

//				try {
//				String url = String.format(leapUrl+"api/copyPiplines/%s/%s?projectId=%s", toProjectName, fromProjectName, String.valueOf(datasetProjectId));
//
//		        HttpClient client = HttpClient.newHttpClient();
//
//		        HttpRequest request = HttpRequest.newBuilder()
//		        		.uri(URI.create(url))
//		        		.header("project",String.valueOf(datasetProjectId) )
//		        		.header("access-token", accessToken)
//		        		.POST(HttpRequest.BodyPublishers.ofString(org))
//		        		.build();
//		        try {
//		        HttpResponse <Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
//		        		  if(response.statusCode()== 200) {
//		        			  logger.info("Copy Pipeline api called succesfully");
//		        		  }else {
//		        			  logger.info("Copy Pipeline api failed");
//		        		  }
//		        }catch(Exception e) {
//		        	logger.info(e.getMessage());
//		        }
			}
		} catch (IOException ex) {
			logger.error(marker, ex.getMessage(), ex);
	}
	}
}