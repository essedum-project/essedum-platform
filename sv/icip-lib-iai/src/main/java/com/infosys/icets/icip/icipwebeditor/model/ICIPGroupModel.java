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
package com.infosys.icets.icip.icipwebeditor.model;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPGroupModel.
 *
 * @author icets
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlgroupmodel", uniqueConstraints = @UniqueConstraint(columnNames = { "model_group", "entity",
		"entity_type", "organization" }))

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

/**
 * Gets the organization.
 *
 * @return the organization
 */
@Getter

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

/**
 * Sets the organization.
 *
 * @param organization the new organization
 */
@Setter

/**
 * Instantiates a new ICIP group model.
 */

/**
 * Instantiates a new ICIP group model.
 */

/**
 * Instantiates a new ICIP group model.
 */
@NoArgsConstructor

/**
 * Instantiates a new ICIP group model.
 *
 * @param id the id
 * @param modelGroup the model group
 * @param groups the groups
 * @param entityType the entity type
 * @param entity the entity
 * @param organization the organization
 */
@AllArgsConstructor

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
public class ICIPGroupModel implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The model group. */
	@Column(name = "model_group")
	private String modelGroup;

	/** The groups. */
	@ManyToOne
	@JoinColumn(updatable = false, insertable = false, name = "model_group", referencedColumnName = "name")
	@JoinColumn(updatable = false, insertable = false, name = "organization", referencedColumnName = "organization")
	@JsonIgnoreProperties("groupsModel")
	@Cascade(CascadeType.MERGE)
	private ICIPGroups groups;

	/** The entity type. */
	@Column(name = "entity_type")
	private String entityType;

	/** The entity. */
	private String entity;

	/** The organization. */
	private String organization;

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
		ICIPGroupModel other = (ICIPGroupModel) obj;
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