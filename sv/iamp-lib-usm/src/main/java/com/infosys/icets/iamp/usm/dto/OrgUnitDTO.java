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

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class OrgUnitDTO.
 *
 * @author icets
 */

/**
 * Gets the organisation.
 *
 * @return the organisation
 */

/**
 * Gets the organisation.
 *
 * @return the organisation
 */
@Getter

/**
 * Sets the organisation.
 *
 * @param organisation the new organisation
 */

/**
 * Sets the organisation.
 *
 * @param organisation the new organisation
 */
@Setter
public class OrgUnitDTO implements Serializable{
	
	/** The id. */
	private Integer id;


	/** The name. */
	private String name;


	/** The description. */
	private String description;


	/** The onboarded. */
	private Boolean onboarded;


	/** The context. */
	private ContextDTO context;


	/** The organisation. */
	private OrganisationDTO organisation;

	

	

}
