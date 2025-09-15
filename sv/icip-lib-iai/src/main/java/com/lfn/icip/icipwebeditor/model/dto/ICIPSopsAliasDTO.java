package com.lfn.icip.icipwebeditor.model.dto;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

//TODO: Auto-generated Javadoc
/**
* A IcmSops.
*/

/**
* @author essedum
*/

/**
* Hash code.
*
* @return the int
*/
@EqualsAndHashCode(onlyExplicitlyIncluded = true)

/**
* Gets the name.
*
* @return the name
*/
@Getter

/**
* Sets the name.
*
* @param name the new name
*/
@Setter
public class ICIPSopsAliasDTO {

	/** The description. */
	private String description;

	/** The alias id. */
	@EqualsAndHashCode.Include
	private Integer alias_id;

	/** The project id. */
	private Integer projectId;

	/** The name. */
	private String name;
	
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
		ICIPSopsAliasDTO other = (ICIPSopsAliasDTO) obj;
		if (alias_id == null) {
			if (other.alias_id != null)
				return false;
		} else if (!alias_id.equals(other.alias_id))
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
		result = prime * result + ((alias_id == null) ? 0 : alias_id.hashCode());
		return result;
	}
}
