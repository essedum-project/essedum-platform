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

import java.sql.Date;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * A UsmModuleOrganisationDTO.
 */
/**
* @author icets
*/

/**
 * Sets the organisation.
 *
 * @param organisation the new organisation
 */

/**
 * Sets the subscription.
 *
 * @param subscription the new subscription
 */

/**
 * Sets the subscription.
 *
 * @param subscription the new subscription
 */
@Setter

/**
 * Gets the organisation.
 *
 * @return the organisation
 */

/**
 * Gets the subscription.
 *
 * @return the subscription
 */

/**
 * Gets the subscription.
 *
 * @return the subscription
 */
@Getter

/**
 * To string.
 *
 * @return the java.lang. string
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
public class UsmModuleOrganisationDTO {
	
	/** The id. */
	private Integer id;
	
	/** The module. */
	private UsmModuleDTO module;
	
	/** The startdate. */
	private Date startdate;
	
	/** The enddate. */
	private Date enddate;
	
	/** The subscriptionstatus. */
	private Boolean subscriptionstatus;
	
	/** The organisation. */
	private ProjectDTO organisation;
	
	/** The subscription. */
	private String subscription;
	
	

}
