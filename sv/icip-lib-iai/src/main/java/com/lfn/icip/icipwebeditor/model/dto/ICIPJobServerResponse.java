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

package com.lfn.icip.icipwebeditor.model.dto;

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
* @author essedum
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
