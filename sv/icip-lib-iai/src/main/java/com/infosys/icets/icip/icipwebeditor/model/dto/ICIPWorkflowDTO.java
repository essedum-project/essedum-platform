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
