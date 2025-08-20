package com.lfn.icip.dataset.model;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import com.lfn.ai.comm.lib.util.domain.BaseDomain;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
//TODO: Auto-generated Javadoc
//
/**
* The Class ICIPRelationship.
*
* @author essedum
*/
@Entity
@Table(name = "mlrelationship", uniqueConstraints = @UniqueConstraint(columnNames = { "name", "organization" }))
/**
 * Gets the last modified date.
 *
 * @return the last modified date
 */

/**
 * Gets the name.
 *
 * @return the name
 */

/**
 * Gets the schema B.
 *
 * @return the schema B
 */
@Getter

/**
 * Sets the last modified date.
 *
 * @param lastModifiedDate the new last modified date
 */

/**
 * Sets the wkname.
 *
 * @param wkname the new wkname
 */

/**
 * Sets the schema B.
 *
 * @param schemaB the new schema B
 */
@Setter

/**
 * Instantiates a new ICIP relationship.
 */

/**
 * Instantiates a new ICIP relationship.
 */
@NoArgsConstructor

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class ICIPRelationship extends BaseDomain implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;
	
	/** The rel_name. */
	private String name;
	
	/** The organization. */
	private String organization;
	
	/** The relationship json. */
	private String schema_relation;

	/** The relationship_template. */
	private String relationship_template;
	
	/**  The schema A. */
	private String schemaA;
	
	/**  The schema B. */
	private String schemaB;

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
		ICIPRelationship other = (ICIPRelationship) obj;
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
		int result = super.hashCode();
		result = prime * result + ((this.getId() == null) ? 0 : id.hashCode());
		return result;
	}

}
