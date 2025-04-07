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
package com.infosys.icets.icip.icipmodelserver.model;

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

import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPPipelineModel.
 *
 * @author icets
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