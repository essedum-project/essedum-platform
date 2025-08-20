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

package com.lfn.icip.dataset.model;

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

import com.lfn.ai.comm.lib.util.listener.AuditListener;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
/**
 * The Class ICIPMlIntstance.
 *
 * @author essedum
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
