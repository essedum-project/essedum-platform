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
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.infosys.icets.ai.comm.lib.util.domain.BaseDomain;
import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDatasource.
 *
 * @author icets
 */
//@MappedSuperclass
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mldatasource", uniqueConstraints = @UniqueConstraint(columnNames = { "name", "organization" }))

/**
 * Gets the organization.
 *
 * @return the organization
 */

/**
 * Gets the last modified date.
 *
 * @return the last modified date
 */

/**
 * Gets the category.
 *
 * @return the category
 */
	@Getter

/**
 * Sets the organization.
 *
 * @param organization the new organization
 */

/**
 * Sets the last modified date.
 *
 * @param lastModifiedDate the new last modified date
 */

/**
 * Sets the category.
 *
 * @param category the new category
 */
@Setter

/**
 * Instantiates a new ICIP datasource.
 */

/**
 * Instantiates a new ICIP datasource.
 */

/**
 * Instantiates a new ICIP datasource.
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
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)

/**
 * Instantiates a new ICIP datasource.
 *
 * @param id the id
 * @param name the name
 * @param description the description
 * @param type the type
 * @param connectionDetails the connection details
 * @param salt the salt
 * @param organization the organization
 * @param dshashcode the dshashcode
 * @param activetime the activetime
 * @param category the category
 */

@AllArgsConstructor
public class ICIPDatasource extends BaseDomain implements Serializable, Cloneable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;
	
	
	public ICIPDatasource(Integer id, String name, String description, String type, String salt, String organization,
            String dshashcode, Timestamp activetime, String category, String interfacetype,
            Boolean fordataset, Boolean forruntime, Boolean foradapter, Boolean formodel,
            Boolean forpromptprovider, Boolean forendpoint, Boolean forapp,
            String lastmodifiedby, Timestamp lastmodifieddate, String alias) {
		
        this.id = id;
		this.name = name;
		this.description = description;
		this.type = type;
		this.salt = salt;
		this.organization = organization;
		this.dshashcode = dshashcode;
		this.activetime = activetime;
		this.category = category;
		this.interfacetype = interfacetype;
		this.fordataset = fordataset;
		this.forruntime = forruntime;
		this.foradapter = foradapter;
		this.formodel = formodel;
		this.forpromptprovider = forpromptprovider;
		this.forendpoint = forendpoint;
		this.forapp = forapp;
		this.lastmodifiedby = lastmodifiedby;
		this.lastmodifieddate = lastmodifieddate;
		this.alias = alias;
}


	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The name. */
	private String name;

	/** The description. */
	private String description;

	/** The type. */
	private String type;

	/** The connection details. */
	@Column(name = "connectiondetails")
	private String connectionDetails;

	/** The salt. */
	private String salt;

	/** The organization. */
	private String organization;

	/** The dshashcode. */
	private String dshashcode;

	/** The activetime. */
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private Timestamp activetime;

	/** The category. */
	private String category;
	
	/** The extras. */
	private String extras;
	
	/** The interfacetype. */
	private String interfacetype;
	
	/** The fordataset.  */
	private Boolean fordataset;
	
	/** The forruntime.  */
	private Boolean forruntime;
	
	/** The foradapter.  */
	private Boolean foradapter;
	
	/** The formodel.  */
	private Boolean formodel;
	
	/** The forpromptprovider.  */
	private Boolean forpromptprovider;
	
	/** The forendpoint.  */
	private Boolean forendpoint;
	
	private Boolean forapp;

	/**
	 * Clone.
	 *
	 * @return the ICIP datasource
	 */
	/*
	 * object ds
	 * set alias,last modified by, last modified date by
	 * return ds*/
	public ICIPDatasource clone() {
		ICIPDatasource ds = new ICIPDatasource(id, name, description, type, connectionDetails, salt, organization,
				dshashcode, activetime, category,extras, interfacetype,fordataset,forruntime,foradapter,formodel,forpromptprovider,forendpoint,forapp);
		ds.setAlias(alias);
		ds.setLastmodifiedby(lastmodifiedby);
		ds.setLastmodifieddate(lastmodifieddate);
		return ds;
	}

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
		ICIPDatasource other = (ICIPDatasource) obj;
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
