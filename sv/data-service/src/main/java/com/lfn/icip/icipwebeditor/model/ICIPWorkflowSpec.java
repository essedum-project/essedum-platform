package com.lfn.icip.icipwebeditor.model;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * A Mlworkflow.
 */
/**
* Gets the last modified date.
*
* @return the last modified date
*/

/**
 * Sets the last modified date.
 *
 * @param lastModifiedDate the new last modified date
 */

/**
 * Instantiates a new ICIP workflow spec.
 */
@Data

/**
 * Instantiates a new ICIP streaming services.
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlworkflowspec")

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
public class ICIPWorkflowSpec implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
//	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The wkspec. */
	@JsonProperty("wkspec")
	private String wkspec;

	/** The wkname. */
	private String wkname;

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
		ICIPWorkflowSpec other = (ICIPWorkflowSpec) obj;
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
