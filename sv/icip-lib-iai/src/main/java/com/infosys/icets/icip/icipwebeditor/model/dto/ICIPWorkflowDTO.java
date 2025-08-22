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

import java.sql.Timestamp;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import org.hibernate.annotations.NaturalId;

import com.infosys.icets.icip.icipwebeditor.model.ICIPWorkflowSpec;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
* Gets the last modified date.
*
* @return the last modified date
*/

/**
 * Gets the organization.
 *
 * @return the organization
 */

/**
 * Gets the organization.
 *
 * @return the organization
 */
@Getter

/**
 * Sets the last modified date.
 *
 * @param lastModifiedDate the new last modified date
 */

/**
 * Sets the organization.
 *
 * @param organization the new organization
 */

/**
 * Sets the organization.
 *
 * @param organization the new organization
 */
@Setter

/**
 * Instantiates a new ICIP workflow training DTO.
 */

/**
 * Instantiates a new ICIP workflow DTO.
 */
@NoArgsConstructor

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ICIPWorkflowDTO {
	/** The Constant serialVersionUID. */

	/** The cid. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The name. */
	@NaturalId
	private String name;

	/** The description. */
	private String description;

	/** The workflow json. */
	private ICIPWorkflowSpec wkspec;
	
	/** The workflow data. */
	private String workflowData;

	/** The current stage. */
	private String currentStage;

	/** The corelid. */
	private String corelid;

	/** The updated on. */
	private Timestamp updatedOn;

	/** The updated by. */
	private String updatedBy;

	/** The organization. */
	private String organization;
	
	public String alias;

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
		ICIPWorkflowDTO other = (ICIPWorkflowDTO) obj;
		if (this.getId() == null) {
			if (other.getId() != null)
				return false;
		} else if (!id.equals(other.getId()))
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
		result = prime * result + ((this.getId() == null) ? 0 : id.hashCode());
		return result;
	}

}
