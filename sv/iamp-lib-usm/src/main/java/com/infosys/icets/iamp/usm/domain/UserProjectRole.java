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
