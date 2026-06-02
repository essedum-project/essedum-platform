package com.lfn.icip.icipwebeditor.model.dto;

import java.time.LocalDate;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;


//TODO: Auto-generated Javadoc
//
/**
* A IcmSops.
*/

/**
* @author essedum
*/

/**
* Gets the flowchart json.
*
* @return the flowchart json
*/
@Getter

/**
* Sets the flowchart json.
*
* @param flowchartJson the new flowchart json
*/
@Setter

/**
* Hash code.
*
* @return the int
*/
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ICIPSopsDTO {

	/** The created by date. */
	private LocalDate createdByDate;

	/** The project id. */
	private Integer projectId;

	/** The details. */
	private String details;

	/** The workflow name. */
	private String workflowName;

	/** The description. */
	private String description;

	/** The id. */
	@EqualsAndHashCode.Include
	private Integer id;

	/** The created by. */
	private String createdBy;

	/** The name. */
	private String name;

	/** The sop doc name. */
	private String sopDocName;

	/** The sop doc content type. */
	private String sopDocContentType;

	/** The alias id. */
	private ICIPSopsAliasDTO aliasId;

	/** The alias type. */
	private String aliasType;

	/** The sop doc. */
	private byte[] sopDoc;

	/** The flowchart json. */
	private String flowchartJson;

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
		ICIPSopsDTO other = (ICIPSopsDTO) obj;
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
