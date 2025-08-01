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

package com.infosys.icets.icip.icipmodelserver.model.dto;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * Gets the load.
 *
 * @return the load
 */

/**
 * Gets the load.
 *
 * @return the load
 */
@Getter

/**
 * Sets the load.
 *
 * @param load the new load
 */

/**
 * Sets the load.
 *
 * @param load the new load
 */
@Setter

/**
 * Instantiates a new ICIP endpoint DTO.
 */

/**
 * Instantiates a new ICIP endpoint DTO.
 */
@NoArgsConstructor

/**
 * Instantiates a new ICIP endpoint DTO.
 *
 * @param endpointname the endpointname
 * @param description the explanation
 * @param apispec the apispec
 * @param modelname the modelname
 * @param organization the organization
 * @param endpointid the id
 */

@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ICIPEndpointsDTO {
	
	Integer endpointid;
	/** The endpointname. */
	String endpointname;

	/** The endpointtype. */
	String endpointtype;

	/** The explanation. */
	String description;

	/** The apispec. */
	String apispec;
	
	Integer id;
	
	/** The organization. */
	String organization;

	/** The connectindetails. */
	String connectiondetails;

	/** The sample. */
	String sample;

	/** The model name. */
	String modelname;

	/** The createdby. */
	String createdby;

	/** The lastmodifiedby. */
	String lastmodifiedby;
	
	Timestamp lastmodifieddate;
	
	String tryoutlink;
	}
