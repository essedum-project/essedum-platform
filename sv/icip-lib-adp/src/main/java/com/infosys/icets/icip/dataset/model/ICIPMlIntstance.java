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
package com.infosys.icets.icip.dataset.model;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;


import java.io.Serializable;

import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
/**
 * The Class ICIPMlIntstance.
 *
 * @author icets
 */
//@MappedSuperclass
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlintstances", uniqueConstraints = @UniqueConstraint(columnNames = { "name", "organization" }))
@Getter
@Setter
@NoArgsConstructor

@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)

@AllArgsConstructor
public class ICIPMlIntstance implements Serializable, Cloneable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The name. */
	@Column(name = "name")
	private String name;

	/** The description. */
	@Column(name = "description")
	private String description;

	/** The alias. */
	@Column(name = "alias")
	private String alias;

	/** The organization. */
	@Column(name = "organization")
	private String organization;

	/** The datasourcenameforconnection. */
	@Column(name = "datasourcenameforconnection")
	private String datasourcenameforconnection;

	/** The datasourcealiasforconnection. */
	@Column(name = "datasourcealiasforconnection")
	private String datasourcealiasforconnection;
	
	/** The adapaternameformethods. */
	@Column(name = "adapaternameformethods")
	private String adapaternameformethods;
	
	/** The adapateraliasformethods. */
	@Column(name = "adapateraliasformethods")
	private String adapateraliasformethods;
	
	/** The interfacetype. */
	@Column(name = "interfacetype")
	private String interfacetype;
	
	/** The type. */
	@Column(name = "type")
	private String type;


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
		ICIPMlIntstance other = (ICIPMlIntstance) obj;
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
