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
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * A UsmPortfolio.
 */
/**
* @author icets
*/

/**
 * Gets the last updated.
 *
 * @return the last updated
 */

/**
 * Gets the last updated.
 *
 * @return the last updated
 */
@Getter

/**
 * Sets the last updated.
 *
 * @param lastUpdated the new last updated
 */

/**
 * Sets the last updated.
 *
 * @param lastUpdated the new last updated
 */
@Setter
@Entity
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = UsmPortfolio.class)
@Table(name = "usm_portfolio")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UsmPortfolio implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	/** The portfolio name. */
	@Column(name = "portfolio_name")
	private String portfolioName;

	/** The description. */
	@Size(max = 500)
	private String description;

	/** The last updated. */
	@Column(name = "last_updated")
	private ZonedDateTime lastUpdated;



	/**
	 * To string.
	 *
	 * @return the string
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return "UsmPortfolio{" + ", id='" + getId() + "'" + ", portfolio_name='" + getPortfolioName() + "'"
				+ ", description='" + getDescription() + "'" + ", last_updated='" + getLastUpdated() + "'" + "}";

	}

}
