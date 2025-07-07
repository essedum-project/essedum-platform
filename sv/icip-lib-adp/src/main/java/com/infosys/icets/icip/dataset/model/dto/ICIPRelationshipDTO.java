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
package com.infosys.icets.icip.dataset.model.dto;

import java.io.Serializable;

import com.infosys.icets.ai.comm.lib.util.domain.BaseDomain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
//TODO: Auto-generated Javadoc
/**
* Gets the last modified date.
*
* @return the last modified date
*/

/**
* Gets the organization.
*
* @return the organization
*/

/**
 * Gets the schema B.
 *
 * @return the schema B
 */
@Getter

/**
 * Sets the last modified date.
 *
 * @param lastModifiedDate the new last modified date
 */

/**
 * Sets the organization.
 *
 * @param organization the new organization
 */

/**
 * Sets the schema B.
 *
 * @param schemaB the new schema B
 */
@Setter

/**
 * Instantiates a new ICIP relationship DTO.
 */

/**
 * Instantiates a new ICIP relationship DTO.
 */
@NoArgsConstructor
public class ICIPRelationshipDTO extends BaseDomain implements Serializable {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;
	
	/** The id. */
	private Integer id;
	
	/** The relationship name. */
	private String name;
	
	/** The organization. */
	private String organization;
	
	/** The relationship json. */
	private String schema_relation;

	/** The relationship template. */
	private String relationship_template;
	
	/** The schemaA. */
	private String schemaA;
	
	/** The schemaB. */
	private String schemaB;
}

