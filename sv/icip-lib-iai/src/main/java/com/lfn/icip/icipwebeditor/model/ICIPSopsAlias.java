package com.lfn.icip.icipwebeditor.model;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@EntityListeners(AuditListener.class)
@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "alias_id", scope = ICIPSopsAlias.class)
@Table(name = "icm_sops_alias")
/**
 * Sets the name.
 *
 * @param name the new name
 */
@Setter

/**
 * Gets the name.
 *
 * @return the name
 */
@Getter

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
public class ICIPSopsAlias implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The description. */
	private String description;

	/** The alias id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer alias_id;

	/** The name. */
	private String name;
	
	/** The project id. */
	private Integer project_id;
	
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
		ICIPSopsAlias other = (ICIPSopsAlias) obj;
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
