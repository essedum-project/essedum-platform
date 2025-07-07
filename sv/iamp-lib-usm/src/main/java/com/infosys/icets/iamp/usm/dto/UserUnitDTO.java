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
 * The Class UserUnitDTO.
 *
 * @author icets
 */

/**
 * Gets the unit.
 *
 * @return the unit
 */

/**
 * Gets the unit.
 *
 * @return the unit
 */
@Getter

/**
 * Sets the unit.
 *
 * @param unit the new unit
 */

/**
 * Sets the unit.
 *
 * @param unit the new unit
 */
@Setter
public class UserUnitDTO implements Serializable {
	
	/** The id. */
	private Integer id;

	
	/** The context. */
	private ContextDTO context;

	
	/** The user. */
	private UsersDTO user;

	
	/** The unit. */
	private OrgUnitDTO unit;

	
}
