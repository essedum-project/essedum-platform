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
import java.sql.Timestamp;

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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPStreamingServices.
 *
 * @author icets
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlworkflow", uniqueConstraints = @UniqueConstraint(columnNames = { "name", "organization" }))

/**
 * Gets the last modified date.
 *
 * @return the last modified date
 */

/**
 * Gets the wkname.
 *
 * @return the wkname
 */

/**
 * Gets the organization.
 *
 * @return the organization
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
 * Sets the organization.
 *
 * @param organization the new organization
 */
@Setter

/**
 * Instantiates a new ICIP streaming services.
 */

/**
 * Instantiates a new ICIP workflow.
 */
@NoArgsConstructor

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ICIPWorkflow implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The wkname. */
	private String name;

	/** The description. */
	private String description;

	/** The workflow json. */
	@JoinColumn(name = "wkspec")
	@ManyToOne
	private ICIPWorkflowSpec wkspec;

	/** The workflow data. */
	@Column(name = "wk_data")
	@JsonProperty("wk_data")
	private String workflowData;

	/** The current stage. */
	@Column(name = "current_stage")
	private String currentStage;

	/** The corelid. */
	private String corelid;

	/** The updated on. */
	@Column(name = "updated_on")
	private Timestamp updatedOn;

	/** The updated by. */
	@Column(name = "updated_by")
	private String updatedBy;

	/** The organization. */
	private String organization;

	public String alias;
	
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
		ICIPWorkflow other = (ICIPWorkflow) obj;
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
