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

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * The Class Reset.
 *
 * @author icets
 */

/**
 * Sets the new .
 *
 * @param  the new new 
 */
@Setter

/**
 * Gets the new .
 *
 * @return the new 
 */
@Getter

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString

/**
 * Instantiates a new reset .
 */
@NoArgsConstructor

/**
 * Hash code.
 *
 * @return the int
 */
 @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ResetPassword implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@EqualsAndHashCode.Include
	private Long id;
	
	/** The current . */
	@JsonProperty(value = "currentPassword")
	private String currentPassword;
	
	/** The new . */
	@JsonProperty(value = "newPassword")
	private String newPassword;

}
