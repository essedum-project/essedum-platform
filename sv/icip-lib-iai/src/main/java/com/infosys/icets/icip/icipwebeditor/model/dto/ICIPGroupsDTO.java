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