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
package com.infosys.icets.icip.icipwebeditor.job.model;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
//This Model is for JobDataMap
/**
 * The Class JobModel.
 *
 * @author icets
 */

/**
 * Gets the time zone.
 *
 * @return the time zone
 */

/**
 * Gets the rest properties.
 *
 * @return the rest properties
 */

/**
 * Gets the rest properties.
 *
 * @return the rest properties
 */
@Getter

/**
 * Sets the time zone.
 *
 * @param timeZone the new time zone
 */

/**
 * Sets the rest properties.
 *
 * @param restProperties the new rest properties
 */

/**
 * Sets the rest properties.
 *
 * @param restProperties the new rest properties
 */
@Setter

/**
 * Instantiates a new job model.
 */

/**
 * Instantiates a new job model.
 */

/**
 * Instantiates a new job model.
 */
@NoArgsConstructor
public class JobModel {

	/** The cname. */
	private String cname;

	/** The org. */
	private String org;

	/** The alias. */
	private String alias;

	/** The params. */
	private String params;

	/** The Job Properties. */
	private JobProperties jobProperties;

	/** The Rest Properties. */
	private RestProperties restProperties;

	/**
	 * The Class JobProperties.
	 *
	 * @author icets
	 */

	/**
	 * Gets the checks if is native.
	 *
	 * @return the checks if is native
	 */
	
	/**
	 * Gets the checks if is native.
	 *
	 * @return the checks if is native
	 */
	@Getter

	/**
	 * Sets the checks if is native.
	 *
	 * @param isNative the new checks if is native
	 */
	
	/**
	 * Sets the checks if is native.
	 *
	 * @param isNative the new checks if is native
	 */
	@Setter

	/**
	 * Instantiates a new job properties.
	 *
	 * @param runtime     the runtime
	 * @param expression  the expression
	 * @param dateTime    the date time
	 * @param timeZone    the time zone
	 * @param submittedBy the submitted by
	 * @param isNative    the is native
	 */
	
	/**
	 * Instantiates a new job properties.
	 *
	 * @param runtime the runtime
	 * @param expression the expression
	 * @param dateTime the date time
	 * @param timeZone the time zone
	 * @param submittedBy the submitted by
	 * @param isNative the is native
	 */
	@AllArgsConstructor
	public static class JobProperties {
		/** The runtime. */
		private String runtime;

		/** The expression. */
		private String expression;

		/** The date time. */
		@NotNull
		private LocalDateTime dateTime;

		/** The time zone. */
		@NotNull
		private String timeZone;

		/** The submitted by. */
		private String submittedBy;

		/** The is native. */
		private String isNative;
		
		/** The is threshold time. */
		private Integer thresholdTime;

		/**
		 * Update date time.
		 *
		 * @param dateTime the date time
		 * @param timeZone the time zone
		 * @return the job model. job properties
		 */
		public JobModel.JobProperties updateDateTime(LocalDateTime dateTime, String timeZone) {
			this.dateTime = dateTime;
			this.timeZone = timeZone;
			return this;
		}
	}

	/**
	 * The Class RestProperties.
	 *
	 * @author icets
	 */

	/**
	 * Gets the rest node id.
	 *
	 * @return the rest node id
	 */
	
	/**
	 * Gets the rest node id.
	 *
	 * @return the rest node id
	 */
	@Getter

	/**
	 * Sets the rest node id.
	 *
	 * @param restNodeId the new rest node id
	 */
	
	/**
	 * Sets the rest node id.
	 *
	 * @param restNodeId the new rest node id
	 */
	@Setter

	/**
	 * Instantiates a new rest properties.
	 *
	 * @param restNode   the rest node
	 * @param restNodeId the rest node id
	 */
	
	/**
	 * Instantiates a new rest properties.
	 *
	 * @param restNode the rest node
	 * @param restNodeId the rest node id
	 */
	@AllArgsConstructor
	public static class RestProperties {
		/** The rest node. */
		private boolean restNode;

		/** The rest node id. */
		private String restNodeId;

		/**
		 * Instantiates a new rest properties.
		 */
		public RestProperties() {
			this.restNode = false;
			this.restNodeId = "";
		}
	}

	/**
	 * Equals.
	 *
	 * @param o the o
	 * @return true, if successful
	 */
	@Override
	public boolean equals(Object o) {
		if (o == null)
			return false;
		if (this.getClass() != o.getClass())
			return false;
		JobModel other = (JobModel) o;
		boolean nameCheck = this.getCname() != null && other.getCname() != null
				? this.getCname().equals(other.getCname())
				: Boolean.FALSE;
		boolean orgCheck = this.getOrg() != null && other.getOrg() != null ? this.getOrg().equals(other.getOrg())
				: Boolean.FALSE;
		boolean userCheck = this.getJobProperties().getSubmittedBy() == null
				&& other.getJobProperties().getSubmittedBy() == null ? Boolean.TRUE
						: this.getJobProperties().getSubmittedBy().equals(other.getJobProperties().getSubmittedBy());
		boolean dateTimeCheck = this.getJobProperties().getDateTime() == null
				&& other.getJobProperties().getDateTime() == null && this.getJobProperties().getTimeZone() == null
				&& other.getJobProperties().getTimeZone() == null ? Boolean.TRUE
						: this.getJobProperties().getDateTime().equals(other.getJobProperties().getDateTime())
								&& this.getJobProperties().getTimeZone().equals(other.getJobProperties().getTimeZone());
		boolean nativeCheck = this.getJobProperties().getIsNative().equals(other.getJobProperties().getIsNative());
		boolean restCheck = (this.getRestProperties().getRestNodeId() == null
				|| this.getRestProperties().getRestNodeId().isEmpty())
				&& (other.getRestProperties().getRestNodeId() == null
						|| other.getRestProperties().getRestNodeId().isEmpty()) ? Boolean.TRUE
								: this.getRestProperties().getRestNodeId()
										.equals(other.getRestProperties().getRestNodeId());
		return nameCheck && orgCheck && userCheck && dateTimeCheck && nativeCheck && restCheck;
	}

	/**
	 * Hash code.
	 *
	 * @return the int
	 */
	@Override
	public int hashCode() {
		return cname.hashCode() * 31 - org.hashCode();
	}

}
