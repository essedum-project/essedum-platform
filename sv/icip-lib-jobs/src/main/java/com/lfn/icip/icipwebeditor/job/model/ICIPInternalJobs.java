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

package com.lfn.icip.icipwebeditor.job.model;

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
import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPInternalJobs.
 *
 * @author essedum
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlinternaljobs")

/**
 * Gets the log.
 *
 * @return the log
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
 * Sets the log.
 *
 * @param log the new log
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
 * Instantiates a new ICIP internal jobs.
 */

/**
 * Instantiates a new ICIP internal jobs.
 */

/**
 * Instantiates a new ICIP internal jobs.
 */
@NoArgsConstructor

/**
 * Instantiates a new ICIP internal jobs.
 *
 * @param id           the id
 * @param jobId        the job id
 * @param jobName      the job name
 * @param organization the organization
 * @param submittedBy  the submitted by
 * @param submittedOn  the submitted on
 * @param jobStatus    the job status
 * @param log          the log
 */

/**
 * Instantiates a new ICIP internal jobs.
 *
 * @param id           the id
 * @param jobId        the job id
 * @param jobName      the job name
 * @param organization the organization
 * @param submittedBy  the submitted by
 * @param submittedOn  the submitted on
 * @param jobStatus    the job status
 * @param log          the log
 * @param dataset      the dataset
 * @param corelid      the corelid
 */

/**
 * Instantiates a new ICIP internal jobs.
 *
 * @param id the id
 * @param jobId the job id
 * @param jobName the job name
 * @param organization the organization
 * @param submittedBy the submitted by
 * @param submittedOn the submitted on
 * @param jobStatus the job status
 * @param log the log
 * @param dataset the dataset
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
public class ICIPInternalJobs implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The job id. */
	@Column(name = "jobid")
	private String jobId;

	/** The job name. */
	@Column(name = "jobname")
	private String jobName;

	/** The organization. */
	private String organization;

	/** The submitted by. */
	@Column(name = "submittedby")
	private String submittedBy;

	/** The submitted on. */
	@Column(name = "submittedon")
	private Timestamp submittedOn;

	/** The job status. */
	@Column(name = "jobstatus")
	private String jobStatus;

	/** The log. */
	private String log;

	/** The dataset. */
	private String dataset;

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
	 * @return the ICIP internal jobs
	 */
	public ICIPInternalJobs updateJob(String status, String log) {
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
	 * @return the ICIP internal jobs
	 */
	public ICIPInternalJobs updateMetadata(MetaData metadata) {
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
	 * Gets the mbattributes.
	 *
	 * @return the mbattributes
	 */
	@Getter
	
	/**
	 * Sets the mbattributes.
	 *
	 * @param mbattributes the new mbattributes
	 */
	@Setter
	
	/**
	 * Instantiates a new meta data.
	 *
	 * @param tag the tag
	 * @param fileid the fileid
	 * @param mbattributes the mbattributes
	 */
	@AllArgsConstructor
	
	/**
	 * Instantiates a new meta data.
	 */
	@NoArgsConstructor
	public static class MetaData implements Serializable {

		/** The Constant serialVersionUID. */
		private static final long serialVersionUID = 8238987716357099213L;

		/** The tag. */
		private String tag;
		
		/** The fileid. */
		private String fileid;
		
		/** The mbattributes. */
		private String mbattributes;
		
		private String name;

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
		ICIPInternalJobs other = (ICIPInternalJobs) obj;
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
