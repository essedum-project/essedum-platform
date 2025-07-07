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
import java.time.ZonedDateTime;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class UserProjectRoleDTO.
 *
 * @author icets
 */

/**
 * Gets the portfolio id.
 *
 * @return the portfolio id
 */

/**
 * Gets the portfolio id.
 *
 * @return the portfolio id
 */
@Getter

/**
 * Sets the portfolio id.
 *
 * @param portfolio_id the new portfolio id
 */

/**
 * Sets the portfolio id.
 *
 * @param portfolio_id the new portfolio id
 */
@Setter
public class UserProjectRoleDTO implements Serializable {
	
	/** The id. */
	private Integer id;


	/** The user id. */
	private UsersDTO user_id;


	/** The project id. */
	private ProjectDTO project_id;


	/** The role id. */
	private RoleDTO role_id;
	
	/** The portfolio id. */
	private UsmPortfolioDTO portfolio_id;
	
	private ZonedDateTime time_stamp;
	

	

}
