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
package com.infosys.icets.icip.icipwebeditor.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPJobServerResponse.
 */
@JsonIgnoreProperties(ignoreUnknown = true)

/**
 * Gets the result.
 *
 * @return the result
 */

/**
 * Gets the result.
 *
 * @return the result
 */

/**
 * Gets the result.
 *
 * @return the result
 */
@Getter 
 /**
  * Sets the result.
  *
  * @param result the new result
  */
 
 /**
  * Sets the result.
  *
  * @param result the new result
  */
 
 /**
  * Sets the result.
  *
  * @param result the new result
  */
 @Setter 
 /**
  * Instantiates a new ICIP job server response.
  */
 
 /**
  * Instantiates a new ICIP job server response.
  */
 
 /**
  * Instantiates a new ICIP job server response.
  */
 @NoArgsConstructor
//
/**
* The Class ICIPJobServerResponse.
*
* @author icets
*/

 public class ICIPJobServerResponse {
	
	/** The status. */
	private String status;
    
    /** The duration. */
    private String duration;
    
    /** The class path. */
    private String classPath;
    
    /** The start time. */
    private String startTime;
    
    /** The context. */
    private String context;
    
    /** The job id. */
    private String jobId;
    
    /** The result. */
    private String result;


	/**
	 * The Enum JobServeResponseType.
	 */
	public enum JobServeResponseType {
		
		/** The success. */
		SUCCESS("SUCCESS"),
		
		/** The started. */
		STARTED("STARTED"),
		
		/** The error. */
		ERROR("ERROR"),
		
		/** The completed. */
		COMPLETED("COMPLETED");

		/** The status. */
		private String status;
		
		/**
		 * Instantiates a new job serve response type.
		 *
		 * @param status the status
		 */
		private JobServeResponseType(String status) {
			this.status = status; 
		}
		
		/**
		 * Gets the status.
		 *
		 * @return the status
		 */
		public String getStatus(){
			return this.status;
		}

	}
}
