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

package com.lfn.icip.icipmodelserver.model;

import java.io.Serializable;
import java.sql.Blob;
import java.sql.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPPipelineModel.
 *
 * @author essedum
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlendpoints", uniqueConstraints = @UniqueConstraint(columnNames = { "endpointname", "organization" }))

/**
 * Gets the organization.
 *
 * @return the organization
 */

/**
 * Gets the metadata.
 *
 * @return the metadata
 */

/**
 * Gets the metadata.
 *
 * @return the metadata
 */
@Getter
/**
 * Sets the organization.
 *
 * @param organization the new organization
 */

/**
 * Sets the metadata.
 *
 * @param metadata the new metadata
 */

/**
 * Sets the metadata.
 *
 * @param metadata the new metadata
 */
@Setter
/**
 * Instantiates a new ICIP pipeline model.
 */

/**
 * Instantiates a new ICIP pipeline model.
 */

/**
 * Instantiates a new ICIP pipeline model.
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
public class ICIPEndpoints implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;
	
	/** The endpointname. */
	private String endpointname;

	/** The endpointtype. */
	private String endpointtype;

	/** The explanation. */
	private String description;

	/** The apispec. */
	private String apispec;

	/** The organization. */
	private String organization;

	/** The connectindetails. */
	private String connectiondetails;

	/** The sample. */
	private String sample;

	/** The model name. */
	private String modelname;

	/** The createdby. */
	private String createdby;

	/** The lastmodifiedby. */
	private String lastmodifiedby;
	
	private Timestamp lastmodifieddate;

	private String tryoutlink;


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
		ICIPEndpoints other = (ICIPEndpoints) obj;
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