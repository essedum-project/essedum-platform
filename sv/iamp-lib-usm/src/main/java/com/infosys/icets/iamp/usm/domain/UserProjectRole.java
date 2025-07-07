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
package com.infosys.icets.iamp.usm.domain;

import java.io.Serializable;
import java.time.ZonedDateTime;


import lombok.EqualsAndHashCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;


import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * A UserProjectRole.
 */
/**
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
@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = UserProjectRole.class)
@Table(name = "usm_user_project_role")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UserProjectRole implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	/** The user id. */
	@JoinColumn(name = "user_id")
	@ManyToOne
	private Users user_id;

	/** The project id. */
	@JoinColumn(name = "project_id")
	@ManyToOne
	private Project project_id;

	/** The role id. */
	@JoinColumn(name = "role_id")
	@ManyToOne
	private Role role_id;

	/** The portfolio id. */
	@JoinColumn(name = "portfolio_id")
	@ManyToOne
	private UsmPortfolio portfolio_id;
	
	
	/** The time stamp **/
	@Column(name = "time_stamp")	
	private ZonedDateTime time_stamp;
	



	/**
	 * To string.
	 *
	 * @return the string
	 */
	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return "UserProjectRole{" + ", id='" + getId() + "'" + "}";

	}
}
