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
import jakarta.persistence.JoinColumn;

import jakarta.persistence.MappedSuperclass;

import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.UniqueConstraint;


import org.hibernate.annotations.Cascade;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.infosys.icets.ai.comm.lib.util.domain.BaseDomain;
import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPDataset.
 *
 * @author icets
 */
//@MappedSuperclass
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mldataset", uniqueConstraints = @UniqueConstraint(columnNames = { "name", "organization" }))

/**
 * Gets the metadata.
 *
 * @return the metadata
 */
@Getter

/**
 * Sets the metadata.
 *
 * @param metadata the new metadata
 */
@Setter

/**
 * Instantiates a new ICIP dataset.
 */
@NoArgsConstructor

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
public class ICIPDataset extends BaseDomain implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The queries. */
	@Transient
	@JsonIgnore
	String[] queries = new String[] {};

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The name. */
	private String name;

	/** The description. */
	private String description;

	/** The schema. */
	@OneToOne
	@JoinColumn(updatable = false, insertable = false, name = "dataset_schema", referencedColumnName = "name")
	@JoinColumn(updatable = false, insertable = false, name = "organization", referencedColumnName = "organization")
	@Cascade(value = org.hibernate.annotations.CascadeType.SAVE_UPDATE)
	private ICIPSchemaRegistry schema;
	
	private String schemajson;

	/** The attributes. */
	private String attributes;

	/** The dashboard. */
	private Integer dashboard;

	/** The type. */
	private String type;

	/** The datasource. */
	@OneToOne
	@JoinColumn(updatable = false, insertable = false, name = "datasource", referencedColumnName = "name")
	@JoinColumn(updatable = false, insertable = false, name = "organization", referencedColumnName = "organization")
	@Cascade(value = org.hibernate.annotations.CascadeType.SAVE_UPDATE)
	private ICIPDatasource datasource;

	/** The backing dataset. */
	@OneToOne
	@JoinColumn(updatable = false, insertable = false, name = "backing_dataset", referencedColumnName = "name")
	@JoinColumn(updatable = false, insertable = false, name = "organization", referencedColumnName = "organization")
	@Cascade(value = org.hibernate.annotations.CascadeType.SAVE_UPDATE)
	@JsonManagedReference("backDataset")
	@JsonBackReference("backDataset")
	private ICIPDataset backingDataset;

	/** The organization. */
	private String organization;

	/** The expStatus. */
	@Column(name = "exp_status")
	private Integer expStatus;

	/** The views. */
	private String views;

	/** The archival config. */
	@Column(name = "archival_config")
	private String archivalConfig;

	/** The is archival enabled. */
	@Column(name = "is_archival_enabled")
	private Boolean isArchivalEnabled = false;

	/**  The isApprovalRequired. */
	@Column(name = "is_approval_required")
	private Boolean isApprovalRequired = false;

	/**  The isPermissionManged. */
	@Column(name = "is_permission_managed")
	private Boolean isPermissionManaged = false;

	/**  The isAuditRequired. */
	@Column(name = "is_audit_required", columnDefinition = "varchar()")
	private Boolean isAuditRequired = false;

	/**  The isInboxRequired. */
	@Column(name = "is_inbox_required")
	private Boolean isInboxRequired = false;
	
	/** The metadata. */
	@Column(name = "metadata")
	private String metadata;
	
	@Column(name = "modeltype")
	private String modeltype;
	
	/** The taskdetails. */
	private String taskdetails; 
	
	/** The tags. */
	private String tags;
	
	@Column(name = "interfacetype")
	private String interfacetype;
	
	@Column(name = "adaptername")
	private String adaptername;
	
	@Column(name = "isadapteractive")
	private String isadapteractive;
	
	@Column(name = "indexname")
	private String indexname;
	
	@Column(name = "summary")
	private String summary;

	@Column(name = "event_details")
	private String event_details;
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
		ICIPDataset other = (ICIPDataset) obj;
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
