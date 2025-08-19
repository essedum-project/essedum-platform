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

import com.google.gson.Gson;
import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;
import com.infosys.icets.icip.icipwebeditor.job.model.ICIPInternalJobs.MetaData;

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
 * Instantiates a new ICIP agent jobs.
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
 * Instantiates a new ICIP agent jobs.
 *
 * @param id the id
 * @param jobId the job id
 * @param submittedBy the submitted by
 * @param cname the cname
 * @param jobStatus the job status
 * @param version the version
 * @param validation the validation
 * @param submittedOn the submitted on
 * @param type the type
 * @param organization the organization
 * @param runtime the runtime
 * @param log the log
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
public class ICIPAgentJobs implements Serializable {

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

	/** The version. */
	private Integer version;

	/** The validation. */
	private String validation;

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

	/** The log. */
	private String log;

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
	 * Update job.
	 *
	 * @param status the status
	 * @param log    the log
	 * @return the ICIP jobs
	 */
	public ICIPAgentJobs updateJob(String status, String log) {
		this.jobStatus = status;
		if (this.log == null || this.log.trim().equalsIgnoreCase("null")) {
			this.log = "";
		}
		this.log = this.log + log;
		return this;
	}

	/**
	 * Update metadata.
	 *
	 * @param metadata the metadata
	 * @return the ICIP agent jobs
	 */
	public ICIPAgentJobs updateMetadata(MetaData metadata) {
		this.setJobmetadata(new Gson().toJson(metadata));
		return this;
	}

	/**
	 * Retrieve metadata.
	 *
	 * @return the meta data
	 */
	public MetaData retrieveMetadata() {
		return new Gson().fromJson(this.jobmetadata, MetaData.class);
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
		ICIPAgentJobs other = (ICIPAgentJobs) obj;
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