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

package com.infosys.icets.icip.icipwebeditor.model;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPEventJobMapping.
 *
 * @author icets
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mleventjobmapping")

/**
 * Gets the organization.
 *
 * @return the organization
 */

/**
 * Gets the body.
 *
 * @return the body
 */

/**
 * Gets the body.
 *
 * @return the body
 */
@Getter
/**
 * Sets the organization.
 *
 * @param organization the new organization
 */

/**
 * Sets the body.
 *
 * @param body the new body
 */

/**
 * Sets the body.
 *
 * @param body the new body
 */
@Setter
/**
 * Instantiates a new ICIP event job mapping.
 */

/**
 * Instantiates a new ICIP event job mapping.
 */

/**
 * Instantiates a new ICIP event job mapping.
 */
@NoArgsConstructor
/**
 * Instantiates a new ICIP event job mapping.
 *
 * @param id           the id
 * @param eventname    the eventname
 * @param jobname      the jobname
 * @param jobtype      the jobtype
 * @param organization the organization
 */

/**
 * Instantiates a new ICIP event job mapping.
 *
 * @param id the id
 * @param eventname the eventname
 * @param jobname the jobname
 * @param jobtype the jobtype
 * @param organization the organization
 * @param description the description
 * @param body the body
 */

/**
 * Instantiates a new ICIP event job mapping.
 *
 * @param id the id
 * @param eventname the eventname
 * @param jobdetails the jobdetails
 * @param organization the organization
 * @param description the description
 * @param body the body
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
public class ICIPEventJobMapping implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The eventname. */
	private String eventname;

	/** The jobname. */
	private String jobdetails;

	/** The organization. */
	private String organization;

	/**  The Description. */
	private String description;

	/**  The request body. */
	private String body;
	
	/**  The InterfaceType. */
	private String interfacetype;

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
		ICIPEventJobMapping other = (ICIPEventJobMapping) obj;
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
