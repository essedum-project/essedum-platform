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
package com.infosys.icets.icip.icipwebeditor.job.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
//This model is for sending data to front-end
/**
 * The Class JobDataModel.
 *
 * @author icets
 */

/**
 * Gets the startexecution.
 *
 * @return the startexecution
 */

/**
 * Gets the quartz properties.
 *
 * @return the quartz properties
 */

/**
 * Gets the quartz properties.
 *
 * @return the quartz properties
 */
@Getter

/**
 * Sets the startexecution.
 *
 * @param startexecution the new startexecution
 */

/**
 * Sets the quartz properties.
 *
 * @param quartzProperties the new quartz properties
 */

/**
 * Sets the quartz properties.
 *
 * @param quartzProperties the new quartz properties
 */
@Setter

/**
 * Instantiates a new job data model.
 */

/**
 * Instantiates a new job data model.
 */

/**
 * Instantiates a new job model DTO.
 */
@NoArgsConstructor
public class JobModelDTO {

	/** The cname. */
	private String cname;

	/** The alias. */
	private String alias;

	/** The repeattype. */
	private String repeattype;

	/** The runtime. */
	private String runtime;

	/** The quartz properties. */
	private QuartzProperties quartzProperties;
	
	/** The jobtimeout. */
	private Integer jobtimeout;

	/** The remoteDatasourceName. */
	private String remoteDatasourceName;
	
	/** The scheduleType. */
	private String scheduleType;
	

	/**
	 * The Class QuartzProperties.
	 *
	 * @author icets
	 */

	/**
	 * Gets the status.
	 *
	 * @return the status
	 */
	
	/**
	 * Gets the status.
	 *
	 * @return the status
	 */
	@Getter

	/**
	 * Sets the status.
	 *
	 * @param status the new status
	 */
	
	/**
	 * Sets the status.
	 *
	 * @param status the new status
	 */
	@Setter

	/**
	 * Instantiates a new quartz properties.
	 *
	 * @param jobDetails     the job details
	 * @param lastexecution  the lastexecution
	 * @param nextexecution  the nextexecution
	 * @param startexecution the startexecution
	 * @param status         the status
	 */
	
	/**
	 * Instantiates a new quartz properties.
	 *
	 * @param jobDetails the job details
	 * @param lastexecution the lastexecution
	 * @param nextexecution the nextexecution
	 * @param startexecution the startexecution
	 * @param status the status
	 */
	@AllArgsConstructor
	public static class QuartzProperties {

		/** The job details. */
		private QuartzJobDetails jobDetails;

		/** The lastexecution. */
		private String lastexecution;

		/** The nextexecution. */
		private String nextexecution;

		/** The startexecution. */
		private String startexecution;

		/** The status. */
		private String status;
		
		

		/**
		 * The Class QuartzJobDetails.
		 *
		 * @author icets
		 */

		/**
		 * Gets the jobgroup.
		 *
		 * @return the jobgroup
		 */
		
		/**
		 * Gets the jobgroup.
		 *
		 * @return the jobgroup
		 */
		@Getter

		/**
		 * Sets the jobgroup.
		 *
		 * @param jobgroup the new jobgroup
		 */
		
		/**
		 * Sets the jobgroup.
		 *
		 * @param jobgroup the new jobgroup
		 */
		@Setter

		/**
		 * Instantiates a new quartz job details.
		 *
		 * @param jobname  the jobname
		 * @param jobgroup the jobgroup
		 */
		
		/**
		 * Instantiates a new quartz job details.
		 *
		 * @param jobname the jobname
		 * @param jobgroup the jobgroup
		 */
		@AllArgsConstructor

		/**
		 * Instantiates a new quartz job details.
		 */
		
		/**
		 * Instantiates a new quartz job details.
		 */
		@NoArgsConstructor
		public static class QuartzJobDetails {
			/** The jobname. */
			private String jobname;

			/** The jobgroup. */
			private String jobgroup;
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
		JobModelDTO other = (JobModelDTO) o;
		boolean nameCheck = this.getCname() != null && other.getCname() != null
				? this.getCname().equals(other.getCname())
				: Boolean.FALSE;
		boolean jobNameCheck = this.getQuartzProperties().getJobDetails().getJobname() == null
				&& other.getQuartzProperties().getJobDetails().getJobname() == null ? Boolean.TRUE
						: this.getQuartzProperties().getJobDetails().getJobname()
								.equals(other.getQuartzProperties().getJobDetails().getJobname());
		boolean jobGroupCheck = this.getQuartzProperties().getJobDetails().getJobgroup() == null
				&& other.getQuartzProperties().getJobDetails().getJobgroup() == null ? Boolean.TRUE
						: this.getQuartzProperties().getJobDetails().getJobgroup()
								.equals(other.getQuartzProperties().getJobDetails().getJobgroup());
		return nameCheck && jobGroupCheck && jobNameCheck;
	}

	/**
	 * Hash code.
	 *
	 * @return the int
	 */
	@Override
	public int hashCode() {
		return cname.hashCode() * 31;
	}

}
