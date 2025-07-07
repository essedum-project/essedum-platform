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
package com.infosys.icets.icip.icipwebeditor.model.dto;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
// TODO: Auto-generated Javadoc
// 

/**
 * The Class ICIPEventJobMappingDTO.
 *
 * @author icets
 */

/**
 * Gets the organization.
 *
 * @return the organization
 */

/**
 * Gets the body.
 *
 * @return the body
 */

/**
 * Gets the body.
 *
 * @return the body
 */
@Getter
/**
 * Sets the organization.
 *
 * @param organization the new organization
 */

/**
 * Sets the body.
 *
 * @param body the new body
 */

/**
 * Sets the body.
 *
 * @param body the new body
 */
@Setter
/**
 * Instantiates a new ICIP event job mapping DTO.
 */

/**
 * Instantiates a new ICIP event job mapping DTO.
 */

/**
 * Instantiates a new ICIP event job mapping DTO.
 */
@NoArgsConstructor

/**
 * Hash code.
 *
 * @return the int
 */

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ICIPEventJobMappingDTO {

	/** The id. */
	@EqualsAndHashCode.Include
	private Integer id;

	/** The eventname. */
	private String eventname;

	/** The jobdetails. */
	private String jobdetails;

	/** The organization. */
	private String organization;

	/** The Description. */
	private String description;

	/** The request body. */
	private String body;

	/**
	 * Checks if is valid.
	 *
	 * @return true, if is valid
	 */
	public boolean isValid() {
		boolean valid = !isNull(eventname) && !isNull(jobdetails) && !isNull(organization);
		return valid && !isEmpty(eventname) && !isEmpty(jobdetails) && !isEmpty(organization);
	}

	/**
	 * Checks if is empty.
	 *
	 * @param string the string
	 * @return true, if is empty
	 */
	private boolean isEmpty(String string) {
		return string.trim().isEmpty();
	}

	/**
	 * Checks if is null.
	 *
	 * @param string the string
	 * @return true, if is null
	 */
	private boolean isNull(String string) {
		return string == null;
	}

	/**
	 * Equals.
	 *
	 * @param obj the obj
	 * @return the boolean value
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ICIPEventJobMappingDTO other = (ICIPEventJobMappingDTO) obj;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		return true;
	}

	/**
	 * hashCode.
	 *
	 * @return the hashcode
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		return result;
	}

}
