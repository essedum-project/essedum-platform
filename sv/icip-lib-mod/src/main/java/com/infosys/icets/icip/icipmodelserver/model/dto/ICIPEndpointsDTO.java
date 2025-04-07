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
