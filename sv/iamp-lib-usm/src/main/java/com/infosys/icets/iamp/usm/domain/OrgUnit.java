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
import lombok.EqualsAndHashCode;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * A OrgUnit.
 */
/**
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
@Entity

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
@Table(name = "usm_unit")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OrgUnit implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	/** The name. */
	@NotNull
	@Size(max = 500)
	private String name;

	/** The description. */
	@Size(max = 500)
	private String description;

	/** The onboarded. */
	private Boolean onboarded;

	/** The context. */
	@JoinColumn(name = "context")
	@ManyToOne
	private Context context;

	/** The organisation. */
	@JoinColumn(name = "organisation")
	@ManyToOne
	private Organisation organisation;

}
