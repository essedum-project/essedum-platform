/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.model;

import java.io.Serializable;
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPJobs.
 *
 * @author icets
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlagentjobs")

/**
 * Gets the hashparams.
 *
 * @return the hashparams
 */

/**
 * Gets the corelid.
 *
 * @return the corelid
 */

/**
 * Gets the jobhide.
 *
 * @return the jobhide
 */
@Getter

/**
 * Sets the hashparams.
 *
 * @param hashparams the new hashparams
 */

/**
 * Sets the corelid.
 *
 * @param corelid the new corelid
 */

/**
 * Sets the jobhide.
 *
 * @param jobhide the new jobhide
 */
@Setter

/**
 * Instantiates a new ICIP jobs.
 */

/**
 * Instantiates a new ICIP agent jobs.
 */

/**
 * Instantiates a new ICIP partial agent jobs.
 */
@NoArgsConstructor

/**
 * Instantiates a new ICIP jobs.
 *
 * @param id               the id
 * @param jobId            the job id
 * @param submittedBy      the submitted by
 * @param streamingService the streaming service
 * @param jobStatus        the job status
 * @param version          the version
 * @param validation       the validation
 * @param submittedOn      the submitted on
 * @param type             the type
 * @param organization     the organization
 * @param log              the log
 * @param runtime          the runtime
 * @param hashparams       the hashparams
 */

/**
 * Instantiates a new ICIP agent jobs.
 *
 * @param id           the id
 * @param jobId        the job id
 * @param submittedBy  the submitted by
 * @param cname        the cname
 * @param jobStatus    the job status
 * @param version      the version
 * @param validation   the validation
 * @param submittedOn  the submitted on
 * @param type         the type
 * @param organization the organization
 * @param log          the log
 * @param runtime      the runtime
 * @param hashparams   the hashparams
 * @param corelid      the corelid
 */

/**
 * Instantiates a new ICIP partial agent jobs.
 *
 * @param id the id
 * @param jobId the job id
 * @param submittedBy the submitted by
 * @param cname the cname
 * @param jobStatus the job status
 * @param submittedOn the submitted on
 * @param type the type
 * @param organization the organization
 * @param runtime the runtime
 * @param hashparams the hashparams
 * @param correlationid the correlationid
 * @param finishtime the finishtime
 * @param jobmetadata the jobmetadata
 * @param jobhide the jobhide
 */
@AllArgsConstructor

/**
 * Hash code.
 *
 * @return the int
 */

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ICIPPartialAgentJobs implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The job id. */
	@Column(unique = true, name = "job_id")
	private String jobId;

	/** The submitted by. */
	@Column(name = "submitted_by")
	private String submittedBy;

	/** The streaming service. */
	@Column(name = "cname")
	private String cname;

	/** The job status. */
	@Column(name = "job_status")
	private String jobStatus;

	/** The submitted on. */
	@Column(name = "submitted_on")
	private Timestamp submittedOn;

	/** The type. */
	@Column(name = "type")
	private String type;

	/** The organization. */
	private String organization;

	/** The runtime. */
	private String runtime;

	/** The hashparams. */
	private String hashparams;
	
	/** The correlationid. */
	private String correlationid;
	
	/** The finishtime. */
	private Timestamp finishtime;
	
	/** The jobmetadata. */
	private String jobmetadata;
	
	/** The jobhide. */
	private Integer jobhide;

	/**
	 * To ICIP agent jobs.
	 *
	 * @param log the log
	 * @return the ICIP agent jobs
	 */
	public ICIPAgentJobs toICIPAgentJobs(String log) {
		return new ICIPAgentJobs(id, jobId, submittedBy, cname, jobStatus, 0, "", submittedOn, type, organization,
				runtime, log, hashparams, correlationid, finishtime, jobmetadata, jobhide);
	}

	/**
	 * Equals.
	 *
	 * @param obj the obj
	 * @return the boolean value
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ICIPPartialAgentJobs other = (ICIPPartialAgentJobs) obj;
		if (this.getId() == null) {
			if (other.getId() != null)
				return false;
		} else if (!id.equals(other.getId()))
			return false;
		return true;
	}

	/**
	 * hashCode.
	 *
	 * @return the hashcode
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((this.getId() == null) ? 0 : id.hashCode());
		return result;
	}

}