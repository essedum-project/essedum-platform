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

import java.util.List;

import com.infosys.icets.ai.comm.lib.util.domain.BaseDomain;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPGroupsDTO.
 *
 * @author icets
 */

/**
 * Gets the groups model.
 *
 * @return the groups model
 */

/**
 * Gets the groups model.
 *
 * @return the groups model
 */

/**
 * Gets the groups model.
 *
 * @return the groups model
 */
@Getter
/**
 * Sets the groups model.
 *
 * @param groupsModel the new groups model
 */

/**
 * Sets the groups model.
 *
 * @param groupsModel the new groups model
 */

/**
 * Sets the groups model.
 *
 * @param groupsModel the new groups model
 */
@Setter
/**
 * Instantiates a new ICIP groups DTO.
 */

/**
 * Instantiates a new ICIP groups DTO.
 */

/**
 * Instantiates a new ICIP groups DTO.
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
public class ICIPGroupsDTO extends BaseDomain{

	/** The id. */
	@EqualsAndHashCode.Include
	private Integer id;

	/** The name. */
	private String name;

	/** The description. */
	private String description;

	/** The organization. */
	private String organization;

	/** The featured. */
	private String featured;

	/** The groups model. */
	private List<ICIPGroupModelDTO> groupsModel;

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
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		ICIPGroupsDTO other = (ICIPGroupsDTO) obj;
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
		int result = super.hashCode();
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		return result;
	}

}