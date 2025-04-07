/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.dto;

import java.io.Serializable;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;


// TODO: Auto-generated Javadoc
/**
 * The Class OrganisationDTO.
 *
 * @author icets
 */

/**
 * Gets the context.
 *
 * @return the context
 */

/**
 * Gets the context.
 *
 * @return the context
 */
@Getter

/**
 * Sets the context.
 *
 * @param context the new context
 */

/**
 * Sets the context.
 *
 * @param context the new context
 */
@Setter
public class OrganisationDTO implements Serializable {
	
	/** The id. */
	private Integer id;

	/** The name. */
	private String name;


	/** The location. */
	private String location;


	/** The division. */
	private String division;


	/** The country. */
	private String country;


	/** The decription. */
	private String decription;

	/** The onboarded. */
	private Boolean onboarded;

	/** The status. */
	private String status;

	/** The createdby. */
	private String createdby;

	/** The createddate. */
	private LocalDate createddate;


	/** The modifiedby. */
	private String modifiedby;


	/** The modifieddate. */
	private LocalDate modifieddate;


	/** The context. */
	private ContextDTO context;

	

	
}
