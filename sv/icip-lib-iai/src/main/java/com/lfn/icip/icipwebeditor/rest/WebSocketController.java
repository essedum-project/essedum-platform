package com.lfn.icip.icipwebeditor.rest;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import com.google.gson.Gson;
import com.lfn.icip.icipwebeditor.job.model.ICIPInternalJobs;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPAgentJobsService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPJobsService;
import com.lfn.icip.icipwebeditor.model.ICIPAgentJobs;
import com.lfn.icip.icipwebeditor.model.ICIPJobs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// TODO: Auto-generated Javadoc
/**
 * The Class WebSocketController.
 */
@Controller
@RefreshScope
public class WebSocketController {
	/** The gson. */
	private final Gson gson;
	
	/** The icip jobs service. */
	private ICIPJobsService icipJobsService;
	
	/** The icip agent jobs service. */
	private ICIPAgentJobsService icipAgentJobsService;
	
	/** The icip internal jobs service. */
	private ICIPInternalJobsService icipInternalJobsService;
	
	@Autowired
	private SimpMessagingTemplate template;

	/**
	 * Instantiates a new web socket controller.
	 *
	 * @param icipJobsService the icip jobs service
	 * @param icipAgentJobsService the icip agent jobs service
	 * @param icipInternalJobsService the icip internal jobs service
	 * 
	 */
	
	
	public WebSocketController(ICIPJobsService icipJobsService, ICIPAgentJobsService icipAgentJobsService,
			ICIPInternalJobsService icipInternalJobsService) {
		this.icipJobsService = icipJobsService;
		this.icipAgentJobsService = icipAgentJobsService;
		this.icipInternalJobsService = icipInternalJobsService;
		this.gson = new Gson();
	}

	/**
	 * Gets the pipeline log.
	 *
	 * @param body the body
	 * @return the pipeline log
	 * @throws IOException 
	 */
	@MessageMapping("/read/runningjob/pipeline")
	@SendTo("/topic/runningjob/pipeline")
	public String getPipelineLog(String body) throws IOException {
		LogBody logBody = this.gson.fromJson(body, LogBody.class);
		ICIPJobs job = icipJobsService.findByJobIdWithLog(logBody.getJobid(), logBody.getOffset(),
				logBody.getLinenumber(), logBody.getOrg(), logBody.getStatus());
		return gson.toJson(job);
	}

	/**
	 * Gets the agent log.
	 *
	 * @param body the body
	 * @return the agent log
	 * @throws IOException 
	 */
	@MessageMapping("/read/runningjob/agent")
	@SendTo("/topic/runningjob/agent")
	public String getAgentLog(String body) throws IOException {
		LogBody logBody = this.gson.fromJson(body, LogBody.class);
		ICIPAgentJobs job = icipAgentJobsService.findByJobIdWithLog(logBody.getJobid(), logBody.getOffset(),
				logBody.getLinenumber(), logBody.getOrg(), logBody.getStatus());
		return gson.toJson(job);
	}

	/**
	 * Gets the internal log.
	 *
	 * @param body the body
	 * @return the internal log
	 * @throws IOException 
	 */
	@MessageMapping("/read/runningjob/internal")
	@SendTo("/topic/runningjob/internal")
	public String getInternalLog(String body) throws IOException {
		LogBody logBody = this.gson.fromJson(body, LogBody.class);
		ICIPInternalJobs job = icipInternalJobsService.findByJobIdWithLog(logBody.getJobid(), logBody.getOffset(),
				logBody.getLinenumber(), logBody.getOrg(), logBody.getStatus());
		return gson.toJson(job);
	}
	

	public String sendUploadStatus(String status) {
	    this.template.convertAndSend("/topic/fileUploadStatus", status);
        return status;
		
	}

	/**
	 * To string.
	 *
	 * @return the java.lang. string
	 */
	@Data
	
	/**
	 * Instantiates a new log body.
	 *
	 * @param jobid the jobid
	 * @param offset the offset
	 * @param linenumber the linenumber
	 * @param org the org
	 * @param status the status
	 */
	@AllArgsConstructor
	
	/**
	 * Instantiates a new log body.
	 */
	@NoArgsConstructor
	class LogBody {
		
		/** The jobid. */
		private String jobid;
		
		/** The offset. */
		private int offset;
		
		/** The linenumber. */
		private int linenumber;
		
		/** The org. */
		private String org;
		
		/** The status. */
		private String status;
	}

}
