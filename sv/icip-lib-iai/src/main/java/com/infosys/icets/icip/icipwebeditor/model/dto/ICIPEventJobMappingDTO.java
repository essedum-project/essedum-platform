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
