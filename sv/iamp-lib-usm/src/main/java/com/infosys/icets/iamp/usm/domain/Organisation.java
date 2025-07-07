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
import java.time.LocalDate;
import lombok.EqualsAndHashCode;

import jakarta.persistence.Column;
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
 * A Organisation.
 */
/**
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
@Entity

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
// @JsonIdentityInfo(generator=ObjectIdGenerators.PropertyGenerator.class,
// property="id", scope=Organisation.class)
@Table(name = "usm_organisation")
public class Organisation implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	/** The name. */
	@NotNull
	@Size(max = 100)
	private String name;

	/** The location. */
	@Size(max = 1500)
	private String location;

	/** The division. */
	@Size(max = 1500)
	private String division;

	/** The country. */
	@Size(max = 1500)
	@Column(name = "country")
	private String country;

	/** The decription. */
	@Size(max = 1500)
	private String decription;

	/** The onboarded. */
	private Boolean onboarded;

	/** The status. */
	@Size(max = 100)
	private String status;

	/** The createdby. */
	@Size(max = 100)
	@Column(name = "created_by")
	private String createdby;

	/** The createddate. */
	@Column(name = "created_date")
	private LocalDate createddate;

	/** The modifiedby. */
	@Size(max = 100)
	@Column(name = "modified_by")
	private String modifiedby;

	/** The modifieddate. */
	@Column(name = "modified_date")
	private LocalDate modifieddate;

	/** The context. */
	@JoinColumn(name = "context")
	@ManyToOne
	private Context context;	

}
