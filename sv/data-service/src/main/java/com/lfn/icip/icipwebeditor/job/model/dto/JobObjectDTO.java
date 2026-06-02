package com.lfn.icip.icipwebeditor.job.model.dto;

import java.util.List;

import org.springframework.lang.NonNull;

import com.lfn.icip.icipwebeditor.job.enums.JobType;
import com.lfn.icip.icipwebeditor.job.enums.RuntimeType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

// TODO: Auto-generated Javadoc
/**
 * Instantiates a new job object DTO.
 *
 * @param jobId the job id
 * @param name the name
 * @param org the org
 * @param alias the alias
 * @param submittedBy the submitted by
 * @param jobs the jobs
 * @param jobType the job type
 * @param corelId the corel id
 * @param expression the expression
 * @param remote the remote
 * @param parallel the parallel
 * @param event the event
 * @param runNow the run now
 */
@AllArgsConstructor

/**
 * To string.
 *
 * @return the java.lang. string
 */
@Data

/**
 * Instantiates a new job object DTO.
 *
 * @param name the name
 * @param org the org
 * @param jobs the jobs
 * @param jobType the job type
 */
@RequiredArgsConstructor
public class JobObjectDTO {

	/** The job id. */
	private String jobId;

	/** The name. */
	@NonNull
	private String name;

	/** The org. */
	@NonNull
	private String org;

	/** The alias. */
	private String alias;

	/** The submitted by. */
	private String submittedBy;

	/** The jobs. */
	@NonNull
	private List<Jobs> jobs;

	/** The job type. */
	@NonNull
	private JobType jobType;

	/** The corel id. */
	private String corelId;
	
	/** The expression. */
	private String expression;

	/** The remote. */
	private boolean remote;
	
	/** The parallel. */
	private boolean parallel;
	
	/** The event. */
	private boolean event;
	
	/** The run now. */
	private boolean runNow;
	
	/** The thresholdTime. */
	private Integer thresholdTime;

	/**
	 * To string.
	 *
	 * @return the java.lang. string
	 */
	@Data
	
	/**
	 * Instantiates a new jobs.
	 *
	 * @param name the name
	 * @param runtime the runtime
	 * @param params the params
	 * @param isRestNode the is rest node
	 * @param restNodeId the rest node id
	 */
	@AllArgsConstructor
	public static class Jobs {

		/** The name. */
		@NonNull
		private String name;

		/** The runtime. */
		@NonNull
		private RuntimeType runtime;

		/** The params. */
		private String params;
		
		/** The is rest node. */
		private boolean isRestNode;
		
		/** The rest node id. */
		private String restNodeId;

	}

	/**
	 * Gets the attributes.
	 *
	 * @return the attributes
	 */
	public JobObjectDTO getAttributes() {
		return new JobObjectDTO(this.name, this.org, this.jobs, this.jobType);
	}

}
