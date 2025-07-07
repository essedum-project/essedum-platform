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
package com.infosys.icets.icip.icipwebeditor.job.model;

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
 * The Class ICIPChains.
 *
 * @author icets
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlchains")

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
 * Gets the parallelchain.
 *
 * @return the parallelchain
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
 * Sets the parallelchain.
 *
 * @param parallelchain the new parallelchain
 */
@Setter

/**
 * Instantiates a new ICIP chains.
 */

/**
 * Instantiates a new ICIP chains.
 */

/**
 * Instantiates a new ICIP chains.
 */
@NoArgsConstructor

/**
 * Instantiates a new ICIP chains.
 *
 * @param id           the id
 * @param jobName      the job name
 * @param description  the description
 * @param jsonContent  the json content
 * @param organization the organization
 */

/**
 * Instantiates a new ICIP chains.
 *
 * @param id           the id
 * @param jobName      the job name
 * @param description  the description
 * @param jsonContent  the json content
 * @param organization the organization
 */

/**
 * Instantiates a new ICIP chains.
 *
 * @param id the id
 * @param jobName the job name
 * @param description the description
 * @param jsonContent the json content
 * @param organization the organization
 * @param parallelchain the parallelchain
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
public class ICIPChains implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The job name. */
	@Column(name = "job_name")
	private String jobName;

	/** The description. */
	private String description;

	/** The json content. */
	@Column(name = "json_content")
	private String jsonContent;

	/** The organization. */
	private String organization;

	/** The parallelchain. */
	private int parallelchain;
	
	/** The flow content. */
	private String flowjson;

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
		ICIPChains other = (ICIPChains) obj;
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
